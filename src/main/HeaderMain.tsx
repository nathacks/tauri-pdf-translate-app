import { Cog } from 'lucide-react';
import { NavLink } from 'react-router';

export function HeaderMain() {
    return (
        <div className={'flex relative'}>
            <span className={'text-xl flex-1 font-semibold text-center'}>Translate PDF</span>
            <NavLink
                to="/settings"
            >
                <Cog className={'absolute right-0  text-red-10'}/>
            </NavLink>
        </div>
    )
}