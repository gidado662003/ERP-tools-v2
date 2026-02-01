import React from 'react'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";
import RequestTableModal from "@/components/internal-requsitions/requestTableModal"

function RequestTableDropDown({ itemId }: { itemId: string }) {
    const triggerInput = (id: string) => {
        document.getElementById(id)?.click();
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className='cursor-pointer'><MoreHorizontal /></div>
                {/* <Button variant="outline">Open</Button> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        triggerInput("view-details");
                    }} className='cursor-pointer'><RequestTableModal itemId={itemId} /></DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>Download PDF</DropdownMenuItem>
                </DropdownMenuGroup>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default RequestTableDropDown