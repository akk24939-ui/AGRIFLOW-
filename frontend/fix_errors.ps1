# Fix all TypeScript errors across the AgriFlow project

# 1. LandsPage.tsx - fix o.name -> o.full_name
$file = 'src\admin\pages\LandsPage.tsx'
$content = Get-Content $file -Raw
$content = $content -replace '\{o\.name\}', '{o.full_name}'
Set-Content $file $content -NoNewline
Write-Host "Fixed LandsPage.tsx"

# 2. AgentApp.tsx - remove unused imports
$file = 'src\agent\AgentApp.tsx'
$content = Get-Content $file -Raw
$content = $content -replace 'import \{ useEffect, useState, useRef \}', 'import { useEffect, useState }'
$content = $content -replace "import \{ tasksApi \} from '\.\.\/admin\/api';`r`n", ''
$content = $content -replace "import \{ tasksApi \} from '\.\.\/admin\/api';`n", ''
$content = $content -replace "import \{ showToast \} from '\.\.\/admin\/components\/ToastContainer';`r`n", ''
$content = $content -replace "import \{ showToast \} from '\.\.\/admin\/components\/ToastContainer';`n", ''
$content = $content -replace 'import \{ LogOut, CheckCircle2, Clock, Upload, Camera, FileText, Video, Play, MapPin \}', 'import { LogOut, Clock }'
$content = $content -replace 'const \[loading, setLoading\] = useState\(false\);', ''
Set-Content $file $content -NoNewline
Write-Host "Fixed AgentApp.tsx"

# 3. AgentTaskDetails.tsx - remove unused imports: CheckCircle2, Play, Pause
$file = 'src\agent\AgentTaskDetails.tsx'
$content = Get-Content $file -Raw
$content = $content -replace 'import \{ ChevronLeft, Camera, Video, FileText, CheckCircle2, Play, Pause, Save, FileImage \}', 'import { ChevronLeft, Camera, Video, FileText, Save, FileImage }'
Set-Content $file $content -NoNewline
Write-Host "Fixed AgentTaskDetails.tsx"

# 4. CustomerApp.tsx - remove unused: FileText, Video
$file = 'src\customer\CustomerApp.tsx'
$content = Get-Content $file -Raw
$content = $content -replace 'import \{ LogOut, Home, AlertCircle, FileText, CheckCircle, Activity, MapPin, ChevronRight, X, Image as ImageIcon, Video, Send \}', 'import { LogOut, Home, AlertCircle, CheckCircle, Activity, MapPin, ChevronRight, X, Image as ImageIcon, Send }'
Set-Content $file $content -NoNewline
Write-Host "Fixed CustomerApp.tsx"

# 5. OwnerApp.tsx - remove unused: Home, Building2, adminApi, showToast
$file = 'src\owner\OwnerApp.tsx'
$content = Get-Content $file -Raw
$content = $content -replace 'import \{.*?adminApi.*?\} from.*?;`r`n', ''
$content = $content -replace 'import \{.*?adminApi.*?\} from.*?;`n', ''
$content = $content -replace "import \{ showToast \} from '\.\.\/admin\/components\/ToastContainer';`r`n", ''
$content = $content -replace "import \{ showToast \} from '\.\.\/admin\/components\/ToastContainer';`n", ''
$content = $content -replace 'import \{(\s*)LayoutDashboard, MapPin, Users, ClipboardList, LogOut,(\s*)Menu, X, Leaf, RefreshCw, Home, ShieldOff, Building2(\s*)\}', 'import {$1LayoutDashboard, MapPin, Users, ClipboardList, LogOut,$2Menu, X, Leaf, RefreshCw, ShieldOff$3}'
Set-Content $file $content -NoNewline
Write-Host "Fixed OwnerApp.tsx"

Write-Host "All fixes applied successfully!"
