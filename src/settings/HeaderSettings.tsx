import { ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router';

export function HeaderSettings() {
    return (
        <div className={'flex relative'}>
            <NavLink
                to="/"
            >
                <div className={'flex p-0.5 text-red-10 absolute left-0 items-center'}>
                    <ChevronLeft /> Back
                </div>
            </NavLink>
            <span className={'text-xl flex-1 font-semibold text-center'}>Settings</span>
        </div>
    )
}