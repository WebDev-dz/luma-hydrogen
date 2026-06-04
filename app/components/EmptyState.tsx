import { PackageOpen } from "lucide-react";



export default function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-cream/40 py-24 text-center">
      <PackageOpen className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.2} />
      <h3 className="mt-4 font-serif text-xl text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );}