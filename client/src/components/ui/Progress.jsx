import * as ProgressPrimitive from '@radix-ui/react-progress'
import clsx from 'clsx'

export default function Progress({ value = 0, max = 100, className, indicatorClassName, ...props }) {
    const percentage = (value / max) * 100

    return (
        <ProgressPrimitive.Root
            className={clsx('relative h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}
            value={value}
            max={max}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={clsx('h-full bg-primary transition-all duration-300', indicatorClassName)}
                style={{ width: `${percentage}%` }}
            />
        </ProgressPrimitive.Root>
    )
}
