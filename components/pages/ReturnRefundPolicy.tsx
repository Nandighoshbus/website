"use client"

import { ArrowLeft, Clock, CreditCard, Shield, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReturnRefundPolicy() {
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
            <h1 className="text-2xl font-bold text-gray-900">Return & Refund Policy</h1>
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
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Return & Refund Policy</span>
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">
                This website is operated by <span className="font-semibold">Saurav Nanda</span>
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                At Nandighosh Bus Service, we are committed to providing transparent and fair refund practices. 
                This policy outlines the terms and conditions for cancellations and refunds for bus ticket bookings.
              </p>
            </CardContent>
          </Card>

          {/* Refund Timeline */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-600" />
                <span>Refund Timeline & Rates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">24+ Hours Before</Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-700">100% Refund</span> - Full refund of ticket amount
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800">12-24 Hours Before</Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">75% Refund</span> - 25% cancellation charges apply
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <Badge className="bg-yellow-100 text-yellow-800">6-12 Hours Before</Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-yellow-700">50% Refund</span> - 50% cancellation charges apply
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <Badge className="bg-red-100 text-red-800">Less than 6 Hours</Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-red-700">No Refund</span> - Tickets are non-refundable
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-purple-600" />
                <span>Refund Process & Duration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How to Request a Refund</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Log into your account on our website or mobile app</li>
                    <li>Go to "My Bookings" section</li>
                    <li>Select the booking you want to cancel</li>
                    <li>Click on "Cancel Booking" button</li>
                    <li>Confirm cancellation and refund will be processed automatically</li>
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Refund Duration & Methods</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Online Payments</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Credit/Debit Cards: 5-7 business days</li>
                        <li>• UPI/Digital Wallets: 3-5 business days</li>
                        <li>• Net Banking: 5-7 business days</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Cash Payments</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Counter bookings: Visit nearest office</li>
                        <li>• Agent bookings: Contact your agent</li>
                        <li>• Processing time: 2-3 business days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Terms */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle>Important Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Non-Refundable Items</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Service charges and convenience fees</li>
                    <li>• Payment gateway charges</li>
                    <li>• Insurance charges (if opted)</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Special Circumstances</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Bus breakdown or service cancellation by us: <span className="font-medium">100% refund</span></li>
                    <li>• Natural disasters or government restrictions: <span className="font-medium">Full refund or rescheduling</span></li>
                    <li>• Medical emergencies: <span className="font-medium">Case-by-case evaluation with valid documents</span></li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                  <h4 className="font-semibold text-gray-900 mb-2">No Refund Scenarios</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Passenger no-show at boarding point</li>
                    <li>• Invalid or expired ID documents</li>
                    <li>• Partial journey completion</li>
                    <li>• Cancellations made after departure time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>Need Help with Refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Customer Support:</span> +91 9778835361</p>
                    <p><span className="font-medium">Email:</span> support@nandighoshbus.com</p>
                    <p><span className="font-medium">WhatsApp:</span> +91 9778835361</p>
                    <p><span className="font-medium">Business Hours:</span> 24/7 Support Available</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Details</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Operated by:</span> Saurav Nanda</p>
                    <p><span className="font-medium">Registered Address:</span> Balasore, Odisha, India</p>
                    <p><span className="font-medium">Service Area:</span> Odisha & Eastern India</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">Note:</span> For faster resolution of refund queries, please have your booking reference number ready when contacting our support team.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
