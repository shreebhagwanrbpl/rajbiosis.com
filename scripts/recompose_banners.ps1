Add-Type -AssemblyName System.Drawing

function Recompose-Banner1 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-1.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-1-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    $newW = 2260
    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # 1. Base background: soft hospital blue-white gradient on top half
    $topGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, 480)),
        [System.Drawing.Color]::FromArgb(240, 246, 250),
        [System.Drawing.Color]::White
    )
    $g.FillRectangle($topGrad, 0, 0, $newW, 480)
    $topGrad.Dispose()

    # 2. Bottom dark red swoosh: #82101B
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 16, 27))
    $swooshPts = @(
        (New-Object System.Drawing.Point(0, 520)),
        (New-Object System.Drawing.Point(600, 500)),
        (New-Object System.Drawing.Point(1130, 510)),
        (New-Object System.Drawing.Point(1700, 500)),
        (New-Object System.Drawing.Point($newW, 520)),
        (New-Object System.Drawing.Point($newW, $h)),
        (New-Object System.Drawing.Point(0, $h))
    )
    $g.FillClosedCurve($redBrush, $swooshPts, [System.Drawing.Drawing2D.FillMode]::Winding, 0.2)
    $redBrush.Dispose()

    # 3. Draw Left Section: Logo + ERBA H-360 text + 4 specs
    # In src: x=0 to 440
    # In canvas: placed at x=40
    $leftSrc = New-Object System.Drawing.Rectangle(0, 0, 440, $h)
    $leftDst = New-Object System.Drawing.Rectangle(40, 0, 440, $h)
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 4. Draw Center Section: "Better Healthcare" + H-360 machine + EC-90 machine
    # In src: x=440 to 1160 (width 720)
    # In canvas: placed at x=770
    $centerSrc = New-Object System.Drawing.Rectangle(440, 0, 720, $h)
    $centerDst = New-Object System.Drawing.Rectangle(770, 0, 720, $h)
    $g.DrawImage($src, $centerDst, $centerSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 5. Draw Right Section: "Partner in Diagnostics" + EC-90 text + 4 specs + test tubes
    # In src: x=1160 to 1600 (width 440)
    # In canvas: placed at x=1780
    $rightSrc = New-Object System.Drawing.Rectangle(1160, 0, 440, $h)
    $rightDst = New-Object System.Drawing.Rectangle(1780, 0, 440, $h)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 6. Fill Gap 1 background (x=460 to 780): clone soft background strips from seam
    $gap1Src = New-Object System.Drawing.Rectangle(430, 0, 15, 500)
    $gap1Dst = New-Object System.Drawing.Rectangle(470, 0, 310, 500)
    $g.DrawImage($src, $gap1Dst, $gap1Src, [System.Drawing.GraphicsUnit]::Pixel)

    # Fill Gap 2 background (x=1480 to 1790)
    $gap2Src = New-Object System.Drawing.Rectangle(1160, 0, 15, 500)
    $gap2Dst = New-Object System.Drawing.Rectangle(1480, 0, 310, 500)
    $g.DrawImage($src, $gap2Dst, $gap2Src, [System.Drawing.GraphicsUnit]::Pixel)

    # Re-draw the sections to ensure crisp borders with subtle alpha blend
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawImage($src, $centerDst, $centerSrc, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Bottom footer icons bar continuation:
    # Clone the bottom icons strip and place properly
    $iconStripSrc = New-Object System.Drawing.Rectangle(480, 580, 640, 80)
    $iconStripDst = New-Object System.Drawing.Rectangle(810, 580, 640, 80)
    $g.DrawImage($src, $iconStripDst, $iconStripSrc, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created wide spread-out Banner 1: $outPath ($newW x $h)"
}

function Recompose-Banner2 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-2.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-2-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    $newW = 1960
    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Gap background: soft warm gradient
    $gapSrc = New-Object System.Drawing.Rectangle(560, 0, 20, $h)
    $gapDst = New-Object System.Drawing.Rectangle(570, 0, 350, $h)
    $g.DrawImage($src, $gapDst, $gapSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Left Section: Logo + "Better Patient Care." + 4 bullet icons
    # src: x=0 to 570
    $leftSrc = New-Object System.Drawing.Rectangle(0, 0, 570, $h)
    $leftDst = New-Object System.Drawing.Rectangle(40, 0, 570, $h)
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Right Section: Both Finecare machines + labels
    # src: x=570 to 1600 (width 1030)
    # canvas: x=900 to 1930
    $rightSrc = New-Object System.Drawing.Rectangle(570, 0, 1030, $h)
    $rightDst = New-Object System.Drawing.Rectangle(890, 0, 1030, $h)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created wide spread-out Banner 2: $outPath ($newW x $h)"
}

function Recompose-Banner3 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-3.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-3-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    $newW = 1960
    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Gap background: soft blue gradient
    $gapSrc = New-Object System.Drawing.Rectangle(630, 0, 20, $h)
    $gapDst = New-Object System.Drawing.Rectangle(640, 0, 360, $h)
    $g.DrawImage($src, $gapDst, $gapSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Left Section: Logo + "COMPLETE IMMUNOASSAY SOLUTIONS" + "SNIBE MAGLUMI" + 4 bullet icons
    # src: x=0 to 640
    $leftSrc = New-Object System.Drawing.Rectangle(0, 0, 640, $h)
    $leftDst = New-Object System.Drawing.Rectangle(40, 0, 640, $h)
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Right Section: 4 Reagent Boxes & blue display podiums
    # src: x=640 to 1600 (width 960)
    # canvas: x=960 to 1920
    $rightSrc = New-Object System.Drawing.Rectangle(640, 0, 960, $h)
    $rightDst = New-Object System.Drawing.Rectangle(960, 0, 960, $h)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created wide spread-out Banner 3: $outPath ($newW x $h)"
}

Recompose-Banner1
Recompose-Banner2
Recompose-Banner3
Write-Host "All 3 banners recomposed with wide edge-to-edge spread!"
