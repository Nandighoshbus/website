"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditions() {
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
            <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Nandighosh Bus Service website and booking platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Booking and Reservations</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• All bookings are subject to availability and confirmation.</p>
                <p>• Passengers must provide accurate personal information during booking.</p>
                <p>• Booking confirmation will be sent via email and SMS.</p>
                <p>• Passengers must carry valid photo identification during travel.</p>
                <p>• Children above 5 years require a separate ticket.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Payment Terms</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• All payments must be made in full at the time of booking.</p>
                <p>• We accept major credit cards, debit cards, and digital payment methods.</p>
                <p>• Payment confirmation is required for ticket validation.</p>
                <p>• All prices are inclusive of applicable taxes.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Cancellation and Refund Policy</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• Cancellations made 24 hours before departure: 90% refund</p>
                <p>• Cancellations made 12-24 hours before departure: 75% refund</p>
                <p>• Cancellations made 6-12 hours before departure: 50% refund</p>
                <p>• Cancellations made less than 6 hours before departure: No refund</p>
                <p>• Refunds will be processed within 7-10 business days.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Passenger Responsibilities</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• Passengers must arrive at the boarding point at least 15 minutes before departure.</p>
                <p>• Smoking, alcohol consumption, and illegal substances are strictly prohibited.</p>
                <p>• Passengers are responsible for their personal belongings.</p>
                <p>• Disruptive behavior may result in removal from the bus without refund.</p>
                <p>• Passengers must comply with all safety instructions from the crew.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Service Limitations</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• Nandighosh Bus Service reserves the right to modify schedules due to operational requirements.</p>
                <p>• We are not liable for delays caused by traffic, weather, or other unforeseen circumstances.</p>
                <p>• Service may be suspended during natural disasters or government restrictions.</p>
                <p>• Alternative arrangements will be made in case of vehicle breakdown.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Liability and Insurance</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• All passengers are covered under our comprehensive insurance policy.</p>
                <p>• Our liability is limited to the ticket value in case of service failure.</p>
                <p>• We are not responsible for indirect or consequential damages.</p>
                <p>• Passengers travel at their own risk regarding personal belongings.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h3>
              <p className="text-gray-700 leading-relaxed">
                Your personal information is collected and used in accordance with our Privacy Policy. We are committed to protecting your privacy and ensuring the security of your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Modifications to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                Nandighosh Bus Service reserves the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>For questions regarding these terms and conditions, please contact us:</p>
                <p><strong>Email:</strong> info@nandighoshbus.com</p>
                <p><strong>Phone:</strong> +91 9778835361</p>
                <p><strong>Address:</strong> Balasore, Odisha, India</p>
                <p><strong>Operated by:</strong> Saurav Nanda</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
