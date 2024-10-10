import { Button } from "../ui/button";

function ModsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Mods for Cyberpunk 2077
        </h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm pt-4 pb-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">(╯°□°）╯︵ ┻━┻</h3>
          <p className="text-sm text-muted-foreground">
            We couldn't connect to the mod servers, try again later
          </p>
          <Button className="mt-4">Retry</Button>
        </div>
      </div>
    </main>
  );
}

export default ModsPage;
