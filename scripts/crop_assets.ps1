Add-Type -AssemblyName System.Drawing

function Crop-MachineAssets {
    # 1. Erba Machines (banner-1.jpg)
    $b1 = [System.Drawing.Bitmap]::FromFile("public/banners/banner-1.jpg")
    $erbaCrop = New-Object System.Drawing.Bitmap(730, 480)
    $g1 = [System.Drawing.Graphics]::FromImage($erbaCrop)
    $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g1.DrawImage($b1, (New-Object System.Drawing.Rectangle(0, 0, 730, 480)), (New-Object System.Drawing.Rectangle(405, 150, 730, 480)), [System.Drawing.GraphicsUnit]::Pixel)
    $g1.Dispose()
    $b1.Dispose()
    $erbaCrop.Save("public/banners/erba-machines.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $erbaCrop.Dispose()
    Write-Host "Saved erba-machines.png"

    # 2. Finecare Machines (banner-2.jpg)
    $b2 = [System.Drawing.Bitmap]::FromFile("public/banners/banner-2.jpg")
    $fineCrop = New-Object System.Drawing.Bitmap(1020, 460)
    $g2 = [System.Drawing.Graphics]::FromImage($fineCrop)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($b2, (New-Object System.Drawing.Rectangle(0, 0, 1020, 460)), (New-Object System.Drawing.Rectangle(570, 80, 1020, 460)), [System.Drawing.GraphicsUnit]::Pixel)
    $g2.Dispose()
    $b2.Dispose()
    $fineCrop.Save("public/banners/finecare-machines.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $fineCrop.Dispose()
    Write-Host "Saved finecare-machines.png"

    # 3. Snibe Reagents (banner-3.jpg)
    $b3 = [System.Drawing.Bitmap]::FromFile("public/banners/banner-3.jpg")
    $snibeCrop = New-Object System.Drawing.Bitmap(970, 480)
    $g3 = [System.Drawing.Graphics]::FromImage($snibeCrop)
    $g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g3.DrawImage($b3, (New-Object System.Drawing.Rectangle(0, 0, 970, 480)), (New-Object System.Drawing.Rectangle(630, 60, 970, 480)), [System.Drawing.GraphicsUnit]::Pixel)
    $g3.Dispose()
    $b3.Dispose()
    $snibeCrop.Save("public/banners/snibe-reagents.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $snibeCrop.Dispose()
    Write-Host "Saved snibe-reagents.png"
}

Crop-MachineAssets
