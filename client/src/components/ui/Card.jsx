import React from 'react';

const Card = React.forwardRef(({ as: Component = 'div', className = '', ...props }, ref) => (
    <Component
        ref={ref}
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-radius-lg shadow-md ${className}`}
        {...props}
    />
));

export default Card;