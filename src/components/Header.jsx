import React from "react";
// Icons import
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

/**
 * **Header**
 * 
 * React functional component that renders the **main header** section  
 * of the BidHouse web application, including both a **contact banner**  
 * and the **navigation header** with logo and external link.
 * 
 * The header is composed of two stacked sections:
 * 
 * 1. **Call Us Banner** – a slim top bar with a phone icon and clickable telephone link.  
 *    When clicked, it triggers the user's phone app (`tel:` link).
 * 2. **Navigation Header** – the main horizontal bar containing the BidHouse logo  
 *    and a navigation button linking to the main website.
 * 
 * ---
 * 
 * @component
 * 
 * @returns {JSX.Element}  
 * A two-part responsive header with contact information and navigation elements.
 * 
 * ---
 * 
 * @example
 * ```jsx
 * import Header from "./Header";
 * 
 * export default function Layout() {
 *   return (
 *     <div className="min-h-screen flex flex-col">
 *       <Header />
 *       <main className="flex-grow">{/* page content * /}</main>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ---
 * 
 * @usage
 * - Used at the top of the BidHouse web app or dashboard pages.  
 * - Combines static branding (logo) with a direct call-to-action (“Call Us”).  
 * - The “Vai al sito” button opens the main public website (`https://bidhouse.it/`) in a new tab.  
 * - Designed to maintain consistent branding across both web app and main site.
 * 
 * @accessibility
 * - The phone link uses `tel:` protocol for accessibility and mobile compatibility.  
 * - `rel="noopener noreferrer"` ensures security for external links.  
 * - Texts and icons provide clear affordances for screen readers.
 */
export default function Header() {
    return (
        <div className="w-full flex flex-col">
            {/* Call Us Banner */}
            <div className="bg-primary place-items-center items-center p-2.5">
                <a
                    href="tel:+390281127665"
                    className="flex flex-row space-x-4 text-white text-xl hover:text-secondary"
                >
                    <LocalPhoneIcon sx={{ fontSize: 30 }} />
                    <h3 className="font-inria">
                        Chiamaci +39 02 8112 7665
                    </h3>
                </a>
            </div>

            {/* Navigation Header */}
            <div className="w-full bg-white h-30    flex flex-row justify-between items-center px-16">
                {/* Logo */}
                <img
                    src="src/assets/bidhouse_logo_black.png"
                    className="object-cover w-40 h-25"
                />

                {/* Navigation Menu */}
                <div>
                    <a
                        className="font-inria font-semibold px-6 py-3 bg-secondary hover:bg-background hover:text flex flex-row justify-center items-center gap-2"
                        href="https://bidhouse.it/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Vai al sito
                        <ArrowCircleRightIcon />
                    </a>
                </div>
            </div>


        </div>
    );
}