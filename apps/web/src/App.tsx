import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="">
        <Button>New List</Button>
      </div>
      <div className=" shadow-blue-700 w-4/5 h-200 border-2">
        lists
      </div>
    </div>
  )
}

export default App
