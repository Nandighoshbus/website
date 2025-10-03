"use client"

import { ArrowLeft, Clock, XCircle, Shield, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Cancellation Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Policy Overview */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <span>Cancellation Policy</span>
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">
                This website is operated by <span className="font-semibold">Saurav Nanda</span>
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                This cancellation policy applies to all bus ticket bookings made through Nandighosh Bus Service. 
                Please read the terms carefully before making your booking as cancellation charges vary based on timing.
              </p>
            </CardContent>
          </Card>

          {/* Cancellation Timeline */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Cancellation Timeline & Charges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-100 text-green-800">24+ Hours Before Departure</Badge>
                      <span className="text-lg font-bold text-green-700">₹0</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Free Cancellation</span><br />
                      No cancellation charges. Full refund of ticket amount.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800">12-24 Hours Before</Badge>
                      <span className="text-lg font-bold text-blue-700">25%</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">25% Cancellation Charge</span><br />
                      75% of ticket amount will be refunded.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">6-12 Hours Before</Badge>
                      <span className="text-lg font-bold text-yellow-700">50%</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">50% Cancellation Charge</span><br />
                      50% of ticket amount will be refunded.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-red-100 text-red-800">Less than 6 Hours</Badge>
                      <span className="text-lg font-bold text-red-700">100%</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">No Refund</span><br />
                      Tickets cannot be cancelled. No refund available.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Important Note</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Cancellation timing is calculated from the scheduled departure time of your bus. 
                    All times are calculated based on Indian Standard Time (IST).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Cancel */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle>How to Cancel Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Online Cancellation</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Visit our website or open mobile app</li>
                    <li>Log into your account</li>
                    <li>Go to "My Bookings" section</li>
                    <li>Find your booking and click "Cancel"</li>
                    <li>Confirm cancellation</li>
                    <li>Refund will be processed automatically</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Offline Cancellation</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <span className="font-medium">Phone:</span> Call +91 9778835361</li>
                    <li>• <span className="font-medium">WhatsApp:</span> Message +91 9778835361</li>
                    <li>• <span className="font-medium">Email:</span> support@nandighoshbus.com</li>
                    <li>• <span className="font-medium">Office Visit:</span> Visit nearest branch</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    Have your booking reference number ready for faster processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Circumstances */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Special Circumstances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-l-4 border-green-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Service Cancellation by Nandighosh</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Bus breakdown or technical issues</li>
                    <li>• Route cancellation due to operational reasons</li>
                    <li>• <span className="font-medium text-green-700">Result: 100% refund + compensation if applicable</span></li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Force Majeure Events</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Natural disasters (floods, cyclones, earthquakes)</li>
                    <li>• Government restrictions or lockdowns</li>
                    <li>• Strikes or bandhs affecting transportation</li>
                    <li>• <span className="font-medium text-blue-700">Result: Full refund or free rescheduling</span></li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Emergencies</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Passenger or immediate family medical emergency</li>
                    <li>• Valid medical certificate required</li>
                    <li>• <span className="font-medium text-yellow-700">Result: Case-by-case evaluation for waiver of cancellation charges</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <span>Important Terms & Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">General Terms</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Cancellation charges are calculated on the base ticket fare</li>
                    <li>Service charges, convenience fees, and taxes are non-refundable</li>
                    <li>Partial cancellations are not allowed for group bookings</li>
                    <li>Refund amount may vary based on payment method used</li>
                    <li>All refunds are processed in INR (Indian Rupees) only</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">No Cancellation Allowed</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>After the scheduled departure time</li>
                    <li>For tickets purchased with special discounts or promotional offers</li>
                    <li>If passenger fails to board despite being present at boarding point</li>
                    <li>For tickets booked under corporate or bulk booking rates</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Refund Processing Time</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Online payments: 5-7 business days</li>
                    <li>Cash payments: 2-3 business days (visit office)</li>
                    <li>UPI/Digital wallets: 3-5 business days</li>
                    <li>Bank transfers: 7-10 business days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>Need Help with Cancellation?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">24/7 Customer Support</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Phone:</span> +91 9778835361</p>
                    <p><span className="font-medium">WhatsApp:</span> +91 9778835361</p>
                    <p><span className="font-medium">Email:</span> support@nandighoshbus.com</p>
                    <p><span className="font-medium">Live Chat:</span> Available on website</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Operated by:</span> Saurav Nanda</p>
                    <p><span className="font-medium">Address:</span> Balasore, Odisha, India</p>
                    <p><span className="font-medium">Aadhar Ref:</span> 938449720041</p>
                    <p><span className="font-medium">Service Since:</span> 1998</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
