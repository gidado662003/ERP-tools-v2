import React, { ReactNode } from 'react'
import { Card } from '../ui/card'
import { cn } from '@/lib/utils' // Optional: utility for conditional classes

interface RequestListCardsProps {
    label: string;
    amount?: number;
    icon?: ReactNode;
    description?: string;
    variant?: 'default' | 'accent' | 'warning' | 'success';
    onClick?: () => void;
    className?: string;
    loading?: boolean;
}

function RequestListCards({
    label,
    amount,
    icon,
    variant = 'default',
    onClick,
    className,
    loading = false
}: RequestListCardsProps) {

    const variantStyles = {
        default: {
            card: "border-gray-200 hover:border-gray-300 bg-white",
            label: "text-gray-600",
            amount: "text-gray-900",
            icon: "text-gray-500"
        },
        accent: {
            card: "border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-25",
            label: "text-blue-700",
            amount: "text-blue-900",
            icon: "text-blue-600"
        },
        warning: {
            card: "border-amber-200 hover:border-amber-300 bg-gradient-to-br from-amber-50 to-amber-25",
            label: "text-amber-700",
            amount: "text-amber-900",
            icon: "text-amber-600"
        },
        success: {
            card: "border-emerald-200 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-25",
            label: "text-emerald-700",
            amount: "text-emerald-900",
            icon: "text-emerald-600"
        }
    }

    const currentVariant = variantStyles[variant]

    return (
        <Card
            className={cn(
                "group transition-all h-[130px] cursor-pointer duration-300 overflow-hidden",
                currentVariant.card,
                onClick && "cursor-pointer hover:shadow-lg active:scale-[0.98]",
                className
            )}
            onClick={onClick}
            role={onClick ? "button" : "article"}
            tabIndex={onClick ? 0 : -1}
        >
            <div className="p-5">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className={cn(
                                "text-sm font-medium tracking-wide uppercase truncate",
                                currentVariant.label
                            )}>

                                {label}
                            </p>
                            {loading && (
                                <div className="w-2 h-2">
                                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-current"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className={cn(
                                "text-3xl font-bold tracking-tight",
                                currentVariant.amount
                            )}>
                                {loading ? '...' : amount}
                            </span>
                        </div>


                    </div>

                    {icon && (
                        <div className={cn(
                            "flex-shrink-0",
                            "p-3 rounded-full transition-all duration-300",
                            "bg-white/80 backdrop-blur-sm",
                            "group-hover:scale-110 group-hover:rotate-6",
                            onClick && "group-active:scale-95",
                            currentVariant.icon
                        )}>
                            <div className="w-6 h-6">
                                {icon}
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress indicator for loading state */}
                {loading && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="animate-pulse h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent w-1/2"></div>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default RequestListCards