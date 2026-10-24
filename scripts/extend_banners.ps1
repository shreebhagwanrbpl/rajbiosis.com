Add-Type -AssemblyName System.Drawing

function Create-CleanWideBanner1 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-1.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-1-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    # Target width 2250 x 666 (ratio 3.38:1)
    $newW = 2250
    $pad = [int](($newW - $w) / 2) # 325px

    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Dark red color #800E18
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(128, 14, 24))
    
    # Left red swoosh extension: starts at y=485 at center seam, slopes slightly down to y=520 at x=0
    $leftPts = @(
        (New-Object System.Drawing.Point(0, 520)),
        (New-Object System.Drawing.Point(($pad + 10), 485)),
        (New-Object System.Drawing.Point(($pad + 10), $h)),
        (New-Object System.Drawing.Point(0, $h))
    )
    $g.FillPolygon($redBrush, $leftPts)

    # Right red swoosh extension: starts at y=500 at center seam, slopes to y=530 at x=$newW
    $rightPts = @(
        (New-Object System.Drawing.Point(($pad + $w - 10), 500)),
        (New-Object System.Drawing.Point($newW, 540)),
        (New-Object System.Drawing.Point($newW, $h)),
        (New-Object System.Drawing.Point(($pad + $w - 10), $h))
    )
    $g.FillPolygon($redBrush, $rightPts)

    # Soft top gradient for left (subtle medical blue-white)
    $leftGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($pad, 0)),
        [System.Drawing.Color]::White,
        [System.Drawing.Color]::FromArgb(242, 247, 250)
    )
    $g.FillRectangle($leftGrad, 0, 0, $pad, 480)

    # Soft top gradient for right
    $rightGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(($pad + $w), 0)),
        (New-Object System.Drawing.Point($newW, 0)),
        [System.Drawing.Color]::FromArgb(242, 247, 250),
        [System.Drawing.Color]::White
    )
    $g.FillRectangle($rightGrad, ($pad + $w), 0, $pad, 490)

    # Draw the original image in center with 100% untouched fidelity
    $g.DrawImage($src, $pad, 0, $w, $h)

    $redBrush.Dispose()
    $leftGrad.Dispose()
    $rightGrad.Dispose()
    $g.Dispose()
    $src.Dispose()

    # Save with high quality
    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created clean $outPath ($newW x $h)"
}

function Create-CleanWideBanner2 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-2.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-2-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    $newW = 1950
    $pad = [int](($newW - $w) / 2) # 175px

    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Left warm gradient
    $leftGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($pad, 0)),
        [System.Drawing.Color]::White,
        [System.Drawing.Color]::FromArgb(254, 250, 245)
    )
    $g.FillRectangle($leftGrad, 0, 0, $pad, $h)

    # Right gradient
    $rightGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(($pad + $w), 0)),
        (New-Object System.Drawing.Point($newW, 0)),
        [System.Drawing.Color]::FromArgb(254, 250, 245),
        [System.Drawing.Color]::White
    )
    $g.FillRectangle($rightGrad, ($pad + $w), 0, $pad, $h)

    # Draw original image
    $g.DrawImage($src, $pad, 0, $w, $h)

    $leftGrad.Dispose()
    $rightGrad.Dispose()
    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created clean $outPath ($newW x $h)"
}

function Create-CleanWideBanner3 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-3.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-3-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    $newW = 1950
    $pad = [int](($newW - $w) / 2)

    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Left cyan/blue gradient
    $leftGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($pad, 0)),
        [System.Drawing.Color]::White,
        [System.Drawing.Color]::FromArgb(242, 248, 253)
    )
    $g.FillRectangle($leftGrad, 0, 0, $pad, $h)

    # Right gradient
    $rightGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(($pad + $w), 0)),
        (New-Object System.Drawing.Point($newW, 0)),
        [System.Drawing.Color]::FromArgb(242, 248, 253),
        [System.Drawing.Color]::White
    )
    $g.FillRectangle($rightGrad, ($pad + $w), 0, $pad, $h)

    # Draw original image
    $g.DrawImage($src, $pad, 0, $w, $h)

    $leftGrad.Dispose()
    $rightGrad.Dispose()
    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created clean $outPath ($newW x $h)"
}

Create-CleanWideBanner1
Create-CleanWideBanner2
Create-CleanWideBanner3
Write-Host "Done all 3 clean wide banners!"
