import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ open, onOpenChange, children, title }) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export const ModalTrigger = Dialog.Trigger
export const ModalClose = Dialog.Close
