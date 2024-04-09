import { Navigation } from "@/components/navigation/navigation";

const MainLayout = ({children} : {children : React.ReactNode}) => {    

    return (
        <div className="h-full w-full flex" >
            <div>
                <Navigation />
            </div>
            <main className="w-full">
                {children}
            </main>
        </div>
    )
};

export default MainLayout;