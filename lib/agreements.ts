export type AgreementType =
  | 'contractor_service'
  | 'onboarding_declaration'
  | 'whs_chemical_safety'
  | 'privacy_customer_access'
  | 'payment_authorisation'

export type AgreementTemplate = {
  type: AgreementType
  version: string
  title: string
  summary: string
  body: string
}

const version = '2026-07-10'

export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    type: 'contractor_service',
    version,
    title: 'Contractor Service Agreement',
    summary: 'ABN cleaner service terms, quality standards and payment basis.',
    body: `This Contractor Service Agreement is between Cleanngo and the contractor named in the onboarding profile.

1. Contractor status
The contractor confirms they provide cleaning services under their own ABN and are responsible for keeping their business, ABN, GST status, insurance and contact details current.

2. Services
The contractor may accept cleaning jobs, recurring visits, end-of-lease work, commercial cleaning, make-good tasks and related services offered by Cleanngo. Cleanngo is not required to offer any minimum number of jobs.

3. Standards
The contractor must attend jobs on time, follow the agreed scope, protect customer property, use safe cleaning practices, upload required proof photos, and promptly report access, damage, safety, timing or quality issues.

4. Payment
Cleanngo records approved jobs, hours, rates, adjustments and payment status in the platform. Payment is made to the bank account supplied by the contractor after admin approval. Payment records include created, approved and paid timestamps.

5. GST and tax
The contractor is responsible for their own tax obligations. If the contractor is GST registered, they must keep Cleanngo updated so payment records can be treated correctly.

6. Insurance and licences
The contractor must maintain any insurance, licences, police checks, working-with-children checks, vehicle details or other documents Cleanngo reasonably requires for assigned work.

7. Customer relationships
The contractor must not bypass Cleanngo, solicit Cleanngo customers directly, move Cleanngo customers to private arrangements, or misuse customer information.

8. Confidentiality
Customer addresses, access notes, contact details, photos, pricing, job notes and Cleanngo operating information are confidential and must only be used for approved work.

9. Cancellations and no-shows
The contractor must give as much notice as possible if they cannot attend. Repeated late cancellations, no-shows or poor-quality work may result in removal from future jobs.

10. Ending the arrangement
Either party may stop offering or accepting work. Cleanngo may immediately remove access where there are safety, privacy, quality, fraud, customer-poaching or serious conduct concerns.

This draft should be reviewed by an Australian solicitor before live use.`,
  },
  {
    type: 'onboarding_declaration',
    version,
    title: 'Onboarding Declaration',
    summary: 'Confirms profile, ABN, bank, work rights and documents are accurate.',
    body: `The contractor declares that the onboarding information supplied to Cleanngo is true and current.

The contractor confirms:
- their legal name, contact details and emergency contact are correct;
- their ABN and business details are correct;
- their bank account details are correct and authorised for payments;
- they have the right to work in Australia;
- any police check, WWCC, licence, insurance and vehicle details supplied are accurate;
- they will promptly update Cleanngo if any detail changes;
- payment depends on approved jobs, approved hours, approved adjustments and admin payment status;
- false or outdated information may delay payments or block job assignment.

This declaration is accepted electronically and stored with a timestamp and agreement snapshot.`,
  },
  {
    type: 'whs_chemical_safety',
    version,
    title: 'WHS And Chemical Safety Acknowledgement',
    summary: 'Safe work, PPE, chemical handling and incident reporting.',
    body: `The contractor acknowledges their safety responsibilities while performing Cleanngo work.

The contractor agrees to:
- use safe work practices at every job;
- use appropriate PPE and equipment;
- read and follow chemical labels and safety instructions;
- never mix chemicals unsafely;
- keep chemicals away from children, pets, food and customer belongings;
- stop and report unsafe work conditions;
- report injuries, incidents, hazards, spills, property damage and near misses promptly;
- take reasonable care for their own safety and the safety of customers, other workers and the public;
- refuse tasks they cannot safely perform and notify Cleanngo immediately.

This acknowledgement does not replace site-specific safety instructions or professional WHS advice.`,
  },
  {
    type: 'privacy_customer_access',
    version,
    title: 'Privacy And Customer Access Agreement',
    summary: 'Customer privacy, access notes, contact rules and photo handling.',
    body: `The contractor agrees to protect customer privacy and property access information.

The contractor must:
- use customer details only for the assigned job;
- keep addresses, phone numbers, access codes, keys, lockbox details and notes confidential;
- not share customer information with anyone outside the approved job;
- not contact customers outside approved work reasons;
- not store customer photos or details on personal systems longer than needed to complete the job upload;
- use before and after photos only for job proof, quality review and customer/admin reporting;
- report any lost key, access issue, accidental disclosure or privacy concern immediately.

Customer trust is part of Cleanngo operations. Misuse of customer information may result in immediate removal from work.`,
  },
  {
    type: 'payment_authorisation',
    version,
    title: 'Payment Authorisation Agreement',
    summary: 'Authorises ABN contractor payment details and timestamped records.',
    body: `The contractor authorises Cleanngo to use the supplied ABN, GST status and bank details for contractor payments.

The contractor confirms:
- BSB, account number and account name have been checked before submission;
- Cleanngo may save staff payment records with timestamps, references, notes and admin approvals;
- a payment marked paid means an admin recorded the transfer, cash payment or other payment as complete;
- incorrect bank details may delay or misdirect payment;
- the contractor must notify Cleanngo before payment if bank, ABN or GST details change.

Cleanngo may export payment and expense records for bookkeeping, accountant review and business reporting.`,
  },
]

export const REQUIRED_AGREEMENT_TYPES = AGREEMENT_TEMPLATES.map((agreement) => agreement.type)

export function getAgreementTemplate(type: AgreementType) {
  return AGREEMENT_TEMPLATES.find((agreement) => agreement.type === type) || null
}
