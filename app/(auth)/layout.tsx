import React from "react";

export default function({children} : {
    children : React.ReactNode
}) {
    return (
        <div className="h-full w-full flex justify-center items-center">
            {children}
        </div>
    )
}