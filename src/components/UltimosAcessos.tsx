import CardImoveis from "./CardImoveis";

export default function UltimosAcessos(){
    return(
        <div className="
            w-300 flex justify-center flex-col gap-5
            ">
            <div className="
                text-black text-start text-3xl font-black
                ">
                    Ultimos acessos:
            </div>
            <div className="
                flex gap-6
                ">
                <CardImoveis/>
                <CardImoveis/>
                <CardImoveis/>   
            </div>
        </div>
    )
}