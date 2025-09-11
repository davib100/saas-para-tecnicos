import { ErrorSystemTest } from "@/components/error-system-test"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"

export default function TestErrorsPage() {
  return (
    <EnhancedErrorBoundary componentName="TestErrorsPage" maxRetries={3}>
      <div className="container mx-auto p-6">
        <ErrorSystemTest />
      </div>
    </EnhancedErrorBoundary>
  )
}
