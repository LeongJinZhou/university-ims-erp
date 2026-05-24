import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>University IMS ERP</CardTitle>
          <CardDescription>University Integrated Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Backend API running at http://localhost:3000
          </p>
          <Button className="w-full" onClick={() => window.location.href = '/api'}>
            View API Docs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App