import { useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void
  onError?: (error: string) => void
}

export function useBarcodeScanner({ onScan, onError }: UseBarcodeScannerOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const elementId = 'barcode-scanner'

  const startScanning = useCallback(async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId)
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          stopScanning()
        },
        () => {
          // Ignore scan errors during scanning
        }
      )

      setIsScanning(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start scanner'
      onError?.(message)
    }
  }, [onScan, onError])

  const stopScanning = useCallback(async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      setIsScanning(false)
    } catch {
      // Ignore stop errors
      setIsScanning(false)
    }
  }, [])

  return {
    isScanning,
    elementId,
    startScanning,
    stopScanning,
  }
}
