import { Navigation } from "@/components/navigation/navigation";

const MainLayout = ({children} : {children : React.ReactNode}) => {    

    return (
        <div className="h-full w-full flex fixed" >
            <div className="">
                <Navigation />
            </div>
            <main className="w-full h-full ">
                {children}
            </main>
        </div>
    )
};

export default MainLayout;