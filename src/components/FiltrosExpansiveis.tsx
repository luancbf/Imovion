export default function FiltrosExpansiveis(){
  return(
    <div className="grid grid-cols-2 gap-5">
      <button className="px-25 py-8 bg-gray-500 hover:bg-gray-700 cursor-pointer">COMPRAR</button>
      <button className="px-25 py-8 bg-gray-500 hover:bg-gray-700 cursor-pointer">ALUGAR</button>
      <button className="px-25 py-8 bg-gray-500 hover:bg-gray-700 cursor-pointer">RURAL</button>
      <button className="px-25 py-8 bg-gray-500 hover:bg-gray-700 cursor-pointer">ANUNCIAR</button>
    </div>
  )
}