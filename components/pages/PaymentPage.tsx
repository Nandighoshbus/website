"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Smartphone, Wallet, Shield, Clock, MapPin, Users, IndianRupee } from "lucide-react"

interface PaymentPageProps {
  currentLanguage: string
}

interface BookingDetails {
  scheduleId: string
  busName: string
  busNumber: string
  busType: string
  route: string
  from: string
  to: string
  date: string
  departureTime: string
  arrivalTime: string
  duration: string
  distance: string
  passengers: number
  baseFare: number
  totalFare: number
  availableSeats: number
}

export default function PaymentPage({ currentLanguage }: PaymentPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get booking details from URL parameters
    const details = {
      scheduleId: searchParams.get('scheduleId') || '',
      busName: searchParams.get('busName') || '',
      busNumber: searchParams.get('busNumber') || '',
      busType: searchParams.get('busType') || '',
      route: searchParams.get('route') || '',
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      departureTime: searchParams.get('departureTime') || '',
      arrivalTime: searchParams.get('arrivalTime') || '',
      duration: searchParams.get('duration') || '',
      distance: searchParams.get('distance') || '',
      passengers: parseInt(searchParams.get('passengers') || '1'),
      baseFare: parseFloat(searchParams.get('baseFare') || '0'),
      totalFare: parseFloat(searchParams.get('totalFare') || '0'),
      availableSeats: parseInt(searchParams.get('availableSeats') || '0')
    }
    setBookingDetails(details)
  }, [searchParams])

  const handlePayment = async () => {
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      // Navigate to success page or booking confirmation
      router.push('/booking-success')
    }, 2000)
  }

  const handleBack = () => {
    router.back()
  }

  if (!bookingDetails) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Routes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Review your trip details and make payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Journey Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{bookingDetails.from} to {bookingDetails.to}</h3>
                    <p className="text-gray-600">{bookingDetails.route}</p>
                  </div>
                  <Badge variant="secondary">{bookingDetails.busType.toUpperCase()}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-semibold">{bookingDetails.departureTime}</p>
                    <p className="text-sm text-gray-600">{bookingDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Arrival</p>
                    <p className="font-semibold">{bookingDetails.arrivalTime}</p>
                    <p className="text-sm text-gray-600">{bookingDetails.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{bookingDetails.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-semibold">{bookingDetails.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Passengers</p>
                    <p className="font-semibold">{bookingDetails.passengers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bus Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Bus Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{bookingDetails.busName}</h3>
                    <p className="text-gray-600">Bus No: {bookingDetails.busNumber}</p>
                    <p className="text-sm text-green-600 mt-1">{bookingDetails.availableSeats} seats available</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{bookingDetails.busType}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPaymentMethod('upi')}
                  >
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-3 text-green-600" />
                      <div>
                        <p className="font-semibold">UPI Payment</p>
                        <p className="text-sm text-gray-600">Pay using Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPaymentMethod('card')}
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-semibold">Credit/Debit Card</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPaymentMethod('wallet')}
                  >
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <p className="font-semibold">Digital Wallet</p>
                        <p className="text-sm text-gray-600">Paytm, Amazon Pay, Mobikwik</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fare ({bookingDetails.passengers} passenger{bookingDetails.passengers > 1 ? 's' : ''})</span>
                    <span>₹{bookingDetails.totalFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Convenience Fee</span>
                    <span>₹10</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{(bookingDetails.totalFare + 10).toLocaleString('en-IN')}</span>
                </div>

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{(bookingDetails.totalFare + 10).toLocaleString('en-IN')}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure payment powered by Razorpay
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
