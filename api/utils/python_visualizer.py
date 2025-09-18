
import contextlib
import io
import json
import sys
import traceback
from types import FrameType
from typing import Any, Dict, List


def safe_repr(value: Any, max_length: int = 120) -> str:
    """Return a human-friendly representation of a Python value."""
    try:
        result = repr(value)
    except Exception:  # pragma: no cover - repr failures are rare and best-effort
        result = f"<unrepresentable {type(value).__name__}>"
    if len(result) > max_length:
        result = result[: max_length - 3] + "..."
    return result


def build_stack(frame: FrameType, user_filename: str) -> List[Dict[str, Any]]:
    """Create a simplified representation of the active call stack."""
    stack: List[Dict[str, Any]] = []
    seen = 0
    while frame is not None and seen < 32:
        code = frame.f_code
        if code.co_filename == user_filename:
            stack.append(
                {
                    "function": code.co_name or "<module>",
                    "line": frame.f_lineno,
                }
            )
        frame = frame.f_back
        seen += 1
    stack.reverse()
    return stack


def tracer_factory(events: List[Dict[str, Any]], stdout_buffer: io.StringIO, user_filename: str):
    """Create a tracing function that records execution events."""

    def _tracer(frame: FrameType, event: str, arg: Any):
        if frame.f_code.co_filename != user_filename:
            return _tracer

        if event not in ("call", "line", "return", "exception"):
            return _tracer

        entry: Dict[str, Any] = {
            "event": event,
            "line": frame.f_lineno,
            "function": frame.f_code.co_name or "<module>",
            "locals": {
                name: safe_repr(value)
                for name, value in frame.f_locals.items()
                if not name.startswith("__") and name != "self"
            },
            "stack": build_stack(frame, user_filename),
            "stdout": stdout_buffer.getvalue(),
        }

        if event == "return":
            entry["returnValue"] = safe_repr(arg)
        elif event == "exception" and isinstance(arg, tuple) and len(arg) >= 2:
            exc_type, exc_value = arg[:2]
            entry["exception"] = {
                "type": getattr(exc_type, "__name__", str(exc_type)),
                "message": safe_repr(exc_value),
            }

        events.append(entry)
        return _tracer

    return _tracer


def main() -> None:
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Expected a single argument with the path to the code file."}))
        return

    code_path = sys.argv[1]
    events: List[Dict[str, Any]] = []
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()

    try:
        with open(code_path, "r", encoding="utf-8") as handle:
            source = handle.read()

        compiled = compile(source, code_path, "exec")
        global_namespace: Dict[str, Any] = {
            "__name__": "__main__",
            "__file__": code_path,
            "__package__": None,
        }

        sys.settrace(tracer_factory(events, stdout_buffer, code_path))
        try:
            with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
                exec(compiled, global_namespace, global_namespace)
        finally:
            sys.settrace(None)

    except Exception as exc:  # pragma: no cover - execution errors are data we want to return
        tb = traceback.format_exc()
        result = {
            "success": False,
            "events": events,
            "stdout": stdout_buffer.getvalue(),
            "stderr": stderr_buffer.getvalue(),
            "error": {
                "message": str(exc),
                "traceback": tb,
            },
        }
    else:
        result = {
            "success": True,
            "events": events,
            "stdout": stdout_buffer.getvalue(),
            "stderr": stderr_buffer.getvalue(),
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
