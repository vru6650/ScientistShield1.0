import { HiArrowUp, HiArrowDown, HiMinusSm } from 'react-icons/hi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * An advanced, reusable card for displaying key statistics with dynamic change indicators and a loading state.
 */
export default function StatCard({
                                     title,
                                     count,
                                     lastMonthCount,
                                     icon: Icon,
                                     iconBgColor,
                                     loading,
                                 }) {
    // 1. Add a skeleton loading state for better UX
    if (loading) {
        return (
            <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
                <div className='flex justify-between'>
                    <div>
                        <h3 className='text-gray-500 text-md uppercase'><Skeleton width={100} /></h3>
                        <p className='text-2xl'><Skeleton width={50} /></p>
                    </div>
                    <Skeleton circle height={50} width={50} />
                </div>
                <div className='flex gap-2 text-sm'>
                    <Skeleton width={80} />
                </div>
            </div>
        );
    }

    // 2. Calculate the change and format numbers
    const change = count - lastMonthCount;
    // Handle division by zero case
    const percentageChange =
        lastMonthCount > 0 ? ((change / lastMonthCount) * 100).toFixed(1) : 0;

    // Format large numbers for readability (e.g., 12500 -> 12.5K)
    const formattedCount = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(count);

    // 3. Determine the color and icon based on the change
    const isPositive = change > 0;
    const isNegative = change < 0;
    const changeColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
    const ChangeIcon = isPositive ? HiArrowUp : isNegative ? HiArrowDown : HiMinusSm;

    return (
        <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
            <div className='flex justify-between'>
                <div>
                    <h3 className='text-gray-500 text-md uppercase'>{title}</h3>
                    <p className='text-2xl'>{formattedCount}</p>
                </div>
                <Icon
                    className={`${iconBgColor} text-white rounded-full text-5xl p-3 shadow-lg`}
                />
            </div>
            <div className='flex gap-2 text-sm'>
        <span className={`${changeColor} flex items-center`}>
          <ChangeIcon className='h-5 w-5' />
            {/* Show the absolute percentage change */}
            {Math.abs(percentageChange)}%
        </span>
                <div className='text-gray-500'>Since last month</div>
            </div>
        </div>
    );
}