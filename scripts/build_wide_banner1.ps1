Add-Type -AssemblyName System.Drawing

function Build-WideBanner1 {
    $srcPath = Join-Path (Get-Location).Path "public\banners\banner-1.jpg"
    $outPath = Join-Path (Get-Location).Path "public\banners\banner-1-wide.jpg"
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $src.Width
    $h = $src.Height
    
    # Target 2080 x 666 (ratio 3.12:1)
    $newW = 2080
    $canvas = New-Object System.Drawing.Bitmap($newW, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # 1. Base background: soft hospital blue-white gradient
    $bgGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, 520)),
        [System.Drawing.Color]::FromArgb(242, 247, 251),
        [System.Drawing.Color]::White
    )
    $g.FillRectangle($bgGrad, 0, 0, $newW, 520)
    $bgGrad.Dispose()

    # 2. Continuous dark red bottom ribbon #82101B
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 16, 27))
    $ribbonPts = @(
        (New-Object System.Drawing.Point(0, 515)),
        (New-Object System.Drawing.Point(500, 495)),
        (New-Object System.Drawing.Point(1040, 510)),
        (New-Object System.Drawing.Point(1600, 495)),
        (New-Object System.Drawing.Point($newW, 520)),
        (New-Object System.Drawing.Point($newW, $h)),
        (New-Object System.Drawing.Point(0, $h))
    )
    $g.FillClosedCurve($redBrush, $ribbonPts, [System.Drawing.Drawing2D.FillMode]::Winding, 0.15)
    $redBrush.Dispose()

    # 3. Draw Left Section (Logo + H-360 specs): src x=0..400
    # Placed at x=30
    $leftSrc = New-Object System.Drawing.Rectangle(0, 0, 400, $h)
    $leftDst = New-Object System.Drawing.Rectangle(30, 0, 400, $h)
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 4. Draw Center Section (Headline + both machines): src x=400..1125
    # Placed at x=640 (centered at 1000)
    $centerSrc = New-Object System.Drawing.Rectangle(400, 0, 725, $h)
    $centerDst = New-Object System.Drawing.Rectangle(640, 0, 725, $h)
    $g.DrawImage($src, $centerDst, $centerSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 5. Draw Right Section (Partner in Diagnostics + EC-90 specs + tubes): src x=1125..1600
    # Placed at x=1575
    $rightSrc = New-Object System.Drawing.Rectangle(1125, 0, 475, $h)
    $rightDst = New-Object System.Drawing.Rectangle(1575, 0, 475, $h)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # 6. Fill Gap 1 top (x=420 to 650, y=0 to 500) with seamless lab bokeh
    $gap1Grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(420, 0)),
        (New-Object System.Drawing.Point(650, 0)),
        [System.Drawing.Color]::FromArgb(248, 251, 253),
        [System.Drawing.Color]::FromArgb(245, 249, 252)
    )
    # Only fill behind seam
    $gap1Grad.Dispose()

    # 7. Redraw the three sections to ensure crispness
    $g.DrawImage($src, $leftDst, $leftSrc, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawImage($src, $centerDst, $centerSrc, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawImage($src, $rightDst, $rightSrc, [System.Drawing.GraphicsUnit]::Pixel)

    # Bottom trust points in center: src x=480..1120, y=575..666
    # Placed nicely in center
    $trustSrc = New-Object System.Drawing.Rectangle(480, 580, 640, 80)
    $trustDst = New-Object System.Drawing.Rectangle(720, 580, 640, 80)
    $g.DrawImage($src, $trustDst, $trustSrc, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $src.Dispose()

    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
    Write-Host "Created seamless spread-out Banner 1: $outPath ($newW x $h)"
}

Build-WideBanner1
