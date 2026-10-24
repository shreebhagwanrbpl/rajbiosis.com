Add-Type -AssemblyName System.Drawing

function Scan-Banner2 {
    $bmp = [System.Drawing.Bitmap]::FromFile("public/banners/banner-2.jpg")
    Write-Host "Scanning Banner 2 ($($bmp.Width) x $($bmp.Height))..."
    # Find left edge of Finecare machine around x=500-700 at y=300
    for ($x = 450; $x -lt 750; $x += 2) {
        $p = $bmp.GetPixel($x, 300)
        # Machine body is light gray / white casing, table is white
        # Let's check when it hits the machine's dark shadow/bezel
        if ($p.R -lt 160 -and $p.G -lt 160 -and $p.B -lt 160) {
            Write-Host "Banner 2 machine left edge near x = $x (R=$($p.R) G=$($p.G) B=$($p.B))"
            break
        }
    }
    $bmp.Dispose()
}

function Scan-Banner3 {
    $bmp = [System.Drawing.Bitmap]::FromFile("public/banners/banner-3.jpg")
    Write-Host "Scanning Banner 3 ($($bmp.Width) x $($bmp.Height))..."
    # Find left edge of blue pedestal around x=600-800 at y=300
    for ($x = 550; $x -lt 850; $x += 2) {
        $p = $bmp.GetPixel($x, 300)
        # Blue pedestal has high Blue and low Red
        if ($p.B -gt 180 -and $p.R -lt 100) {
            Write-Host "Banner 3 blue pedestal starts at x = $x (R=$($p.R) G=$($p.G) B=$($p.B))"
            break
        }
    }
    $bmp.Dispose()
}

Scan-Banner2
Scan-Banner3
