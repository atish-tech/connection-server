import React from "react";

function Auth({children} : {
    children : React.ReactNode
}) {
    return (
        <div className="h-full w-full flex justify-center items-center">
            {children}
        </div>
    )
};

export default Auth