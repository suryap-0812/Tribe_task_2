import { forwardRef } from 'react'
import clsx from 'clsx'

export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
    return (
        <input
            type={type}
            className={clsx(
                'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    )
})

Input.displayName = 'Input'

export const Textarea = forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            className={clsx(
                'flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    )
})

Textarea.displayName = 'Textarea'

export const Label = forwardRef(({ className, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={clsx('text-sm font-medium text-gray-700', className)}
            {...props}
        />
    )
})

Label.displayName = 'Label'
