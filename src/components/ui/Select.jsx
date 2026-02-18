import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function Select({ children, ...props }) {
    return (
        <SelectPrimitive.Root {...props}>
            {children}
        </SelectPrimitive.Root>
    )
}

export function SelectTrigger({ children, className, ...props }) {
    return (
        <SelectPrimitive.Trigger
            className={clsx(
                'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
}

export function SelectContent({ children, className, ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={clsx(
                    'relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
                    'animate-in fade-in-80',
                    className
                )}
                {...props}
            >
                <SelectPrimitive.Viewport className="p-1">
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
}

export function SelectItem({ children, className, ...props }) {
    return (
        <SelectPrimitive.Item
            className={clsx(
                'relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none',
                'focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
}

export const SelectValue = SelectPrimitive.Value
