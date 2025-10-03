"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
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
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nandighosh Bus Service ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and booking services.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Business Information</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Operated by:</span> Saurav Nanda</p>
                  <p><span className="font-medium">Registered Address:</span> Balasore, Odisha, India</p>
                  <p><span className="font-medium">Aadhar Reference:</span> 938449720041</p>
                  <p><span className="font-medium">Contact:</span> +91 9778835361</p>
                  <p><span className="font-medium">Email:</span> privacy@nandighoshbus.com</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
              
              <h4 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h4>
              <div className="text-gray-700 leading-relaxed space-y-2 mb-4">
                <p>• Full name and contact details (phone number, email address)</p>
                <p>• Age and gender for booking purposes</p>
                <p>• Government-issued ID details for verification</p>
                <p>• Payment information (processed securely through third-party providers)</p>
                <p>• Travel preferences and booking history</p>
              </div>

              <h4 className="text-lg font-medium text-gray-900 mb-3">Technical Information</h4>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>• IP address and browser information</p>
                <p>• Device type and operating system</p>
                <p>• Website usage patterns and analytics</p>
                <p>• Cookies and similar tracking technologies</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>• <strong>Booking Services:</strong> To process reservations and provide travel services</p>
                <p>• <strong>Communication:</strong> To send booking confirmations, updates, and customer support</p>
                <p>• <strong>Payment Processing:</strong> To handle transactions securely</p>
                <p>• <strong>Service Improvement:</strong> To enhance our website and services</p>
                <p>• <strong>Marketing:</strong> To send promotional offers (with your consent)</p>
                <p>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                <p>• <strong>Service Providers:</strong> With trusted partners who assist in providing our services</p>
                <p>• <strong>Payment Processors:</strong> With secure payment gateways for transaction processing</p>
                <p>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</p>
                <p>• <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</p>
                <p>• <strong>Emergency Situations:</strong> To protect the safety of our passengers and staff</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <p>• SSL encryption for data transmission</p>
                <p>• Secure servers with restricted access</p>
                <p>• Regular security audits and updates</p>
                <p>• Employee training on data protection</p>
                <p>• Compliance with industry security standards</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>We use cookies and similar technologies to:</p>
                <p>• Remember your preferences and settings</p>
                <p>• Analyze website traffic and usage patterns</p>
                <p>• Provide personalized content and advertisements</p>
                <p>• Improve website functionality and user experience</p>
                <p>You can control cookie settings through your browser preferences.</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>You have the right to:</p>
                <p>• <strong>Access:</strong> Request copies of your personal information</p>
                <p>• <strong>Correction:</strong> Update or correct inaccurate information</p>
                <p>• <strong>Deletion:</strong> Request deletion of your personal data</p>
                <p>• <strong>Portability:</strong> Request transfer of your data to another service</p>
                <p>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</p>
                <p>• <strong>Restrict Processing:</strong> Limit how we use your information</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h3>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking records are typically retained for 7 years for accounting and legal purposes. You may request earlier deletion of your data, subject to legal requirements.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h3>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h3>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last updated" date. Your continued use of our services constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <p><strong>Email:</strong> saurav@nandighoshbus.com</p>
                <p><strong>Phone:</strong> +91 9778835361</p>
                <p><strong>Address:</strong> Balasore, Odisha, India</p>
                <p><strong>Operated by:</strong> Saurav Nanda (Aadhar: 938449720041)</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                By using our services, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
