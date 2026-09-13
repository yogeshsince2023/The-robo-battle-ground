import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/container";
import { CertificateVerifyForm } from "@/components/forms/certificate-verify-form";

export const metadata: Metadata = {
  title: "Certificate Verification",
  description: "Verify the authenticity of a training certificate issued by us using its certificate number.",
};

export default function CertificateVerificationPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Verification"
          title="Certificate Verification"
          description="Enter a certificate number to confirm its authenticity, training program, and status."
          center
        />
        <div className="mt-10">
          <CertificateVerifyForm />
        </div>
      </Container>
    </div>
  );
}
