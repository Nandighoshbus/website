"use client"

import { ArrowLeft, Truck, Clock, Package, MapPin, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ShippingPolicy() {
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
            <h1 className="text-2xl font-bold text-gray-900">Shipping & Delivery Policy</h1>
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
                <Truck className="w-6 h-6 text-blue-600" />
                <span>Shipping & Delivery Policy</span>
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">
                This website is operated by <span className="font-semibold">Saurav Nanda</span>
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                This policy covers the delivery of tickets, travel documents, and any physical items related to 
                Nandighosh Bus Service bookings. As a transportation service, most of our deliverables are digital, 
                but this policy also covers special circumstances requiring physical delivery.
              </p>
            </CardContent>
          </Card>

          {/* Digital Delivery */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-green-600" />
                <span>Digital Ticket Delivery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">Instant Delivery</Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">E-Tickets</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Delivered immediately after payment confirmation</li>
                      <li>• Sent to registered email address</li>
                      <li>• SMS confirmation with booking details</li>
                      <li>• Available in "My Bookings" section</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800">Within 5 Minutes</Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Booking Confirmation</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Email with complete journey details</li>
                      <li>• WhatsApp message with ticket link</li>
                      <li>• Push notification on mobile app</li>
                      <li>• Downloadable PDF ticket</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">Important</span>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Check spam/junk folder if email not received</li>
                      <li>• Ensure correct email and phone number</li>
                      <li>• Contact support if not received within 10 minutes</li>
                      <li>• Keep digital ticket accessible during travel</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile App Benefits</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Offline ticket access</li>
                      <li>• Real-time bus tracking</li>
                      <li>• Instant notifications</li>
                      <li>• Easy ticket management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Delivery */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-orange-600" />
                <span>Physical Delivery Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Available Services</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Printed Tickets</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Available on request</li>
                        <li>• Delivery within Balasore: Same day</li>
                        <li>• Other Odisha cities: 1-2 days</li>
                        <li>• Delivery charges: ₹50-100</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Travel Documents</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Special permits or passes</li>
                        <li>• Group booking documents</li>
                        <li>• Corporate travel vouchers</li>
                        <li>• Insurance certificates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Delivery Timeline & Charges</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-gray-900">Location</th>
                          <th className="text-left py-2 font-medium text-gray-900">Delivery Time</th>
                          <th className="text-left py-2 font-medium text-gray-900">Charges</th>
                          <th className="text-left py-2 font-medium text-gray-900">Method</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr className="border-b">
                          <td className="py-2">Balasore City</td>
                          <td className="py-2">Same day (2-4 hours)</td>
                          <td className="py-2">₹50</td>
                          <td className="py-2">Hand delivery</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Balasore District</td>
                          <td className="py-2">1 day</td>
                          <td className="py-2">₹75</td>
                          <td className="py-2">Local courier</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Other Odisha Cities</td>
                          <td className="py-2">1-2 days</td>
                          <td className="py-2">₹100</td>
                          <td className="py-2">Speed post</td>
                        </tr>
                        <tr>
                          <td className="py-2">Outside Odisha</td>
                          <td className="py-2">2-5 days</td>
                          <td className="py-2">₹150</td>
                          <td className="py-2">Registered post</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Services */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle>Special Delivery Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Express Delivery</h4>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Same day delivery in Balasore</li>
                      <li>• Within 2 hours for urgent requests</li>
                      <li>• Additional charges: ₹100</li>
                      <li>• Available 24/7 for emergencies</li>
                      <li>• Call +91 9778835361 for booking</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bulk Delivery</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• For corporate bookings (50+ tickets)</li>
                      <li>• Group tour packages</li>
                      <li>• Educational institution bookings</li>
                      <li>• Free delivery within city limits</li>
                      <li>• Dedicated account manager support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="mb-8 shadow-sm border">
            <CardHeader>
              <CardTitle>Delivery Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Requirements</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Valid address with landmark details</li>
                    <li>• Recipient must be available during delivery hours</li>
                    <li>• Valid ID proof required for collection</li>
                    <li>• Delivery attempts: Maximum 3 times</li>
                    <li>• Undelivered items returned to office after 7 days</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Exclusions</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Remote areas without proper road connectivity</li>
                    <li>• During natural disasters or emergencies</li>
                    <li>• Government restricted areas</li>
                    <li>• Incorrect or incomplete address provided</li>
                    <li>• Recipient unavailable after 3 attempts</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-400">
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Guarantee</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Tracking number provided for all deliveries</li>
                    <li>• SMS/WhatsApp updates on delivery status</li>
                    <li>• Refund of delivery charges if delayed beyond promised time</li>
                    <li>• Insurance coverage for lost or damaged items</li>
                    <li>• 24/7 customer support for delivery queries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>Delivery Support & Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Support</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Phone:</span> +91 9778835361</p>
                    <p><span className="font-medium">WhatsApp:</span> +91 9778835361</p>
                    <p><span className="font-medium">Email:</span> hello@nandighoshbus.com</p>
                    <p><span className="font-medium">Support Hours:</span> 24/7 Available</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Address</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Operated by:</span> Saurav Nanda</p>
                    <p><span className="font-medium">Head Office:</span> Balasore, Odisha, India</p>
                    <p><span className="font-medium">Service Area:</span> Odisha & Eastern India</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> For fastest service, we recommend using digital tickets. 
                  Physical delivery is available as a convenience service with additional charges.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
