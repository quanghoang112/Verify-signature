# 1. Introduction:
- In the modern technological landscape, we have access to various software supporting online signing, categorized into **Electronic Signatures** and **Digital Signatures**.
- However, these two types are fundamentally different:
	- **Electronic Signature**: Simply a mark — such as a photo of a handwritten signature, a checkbox, or digital brushstrokes. Authentication is usually limited to basic factors like email or passwords. It offers low security and lacks legal validity for sensitive documents. However, it is user-friendly and highly accessible.
	- **Digital signature**: Utilizes cryptographic algorithms ($EdDSA, RSA, ECDSA$) to ensure security properties such as data integrity and non-repudiation. Conversely, this method involves complex computational steps and is less intuitive for the average user.

$\Rightarrow$ **DocuSign** bridges this gap by providing a user interface as simple as an electronic signature while implementing back-end security equivalent to a digital signature. Documents signed by DocuSign are recognized by European institutions and meet the rigorous standards of the U.S. Food and Drug Administration (FDA).
## 1.1. DocuSign security implementation:
**Note**: DocuSign delivers documents via the recipient's email, and the primary layer of security is guaranteed by _DocuSign, Inc_.
- Authentication methods:
	- **SES (Standard Electronic Signature)**: The standard method; requires only access to the recipient's email to sign.
	- **AES (Advanced Electronic Signature)**: Requires identity verification by capturing a photo of a Citizen ID card, which the DocuSign system validates.
	- **QES (Qualified Electronic Signature)**: DocuSign utilizes a trusted third party (e.g., a government agency) to perform face-to-face verification via video call or voice recording.
- After signing process is succeed:
	- **PKI Workflow**: DocuSign executes a Public Key Infrastructure (PKI) process, generating $PK_{docuSign}$ and $VK_{docuSign}$. These keys are certified to bind with DocuSign, Inc. to sign the contract and the certificate, ensuring data integrity.
	- **Tracking**: A security code and CoC (Certificate of Completion) are generated to store all contract metadata and facilitate database lookups.
	- **Storage**: The contract and its CoC are stored on DocuSign servers, encrypted using AES-256.
## 1.2. Digital Signature Mechanism:
- The signing process:
	- DocuSign hashes the entire contract content and adds it to the certificate: $H_{mess} = SHA256(messageDigest)$.
	- The entire certificate content is hashed: $H_{cert} = SHA256(content_{cert} || H_{mess})$.
	- DocuSign signs the certificate hash: $Sign_{docuSign} = E_{VK_{docuSign}}(H_{cert})$.
	- The value $Sign_{docuSign}$ is appended to the final certificate.
	- The plaintext of the $certificate_{final}$ is embedded within the PDF contract.
- The verification process:
	- Third parties use $PK_{docuSign}$ to decrypt the hash: $H_{cert} = D_{PK_{docuSign}}(Sign_{docuSign})$.
	- The certificate content is re-hashed: $H_{cert}' = SHA256(content_{cert} || H_{mess})$. If $H_{cert}' == H_{cert}$, the certificate content is untampered, implying $H_{mess}$ is valid.
	- The contract content is re-hashed: $H_{mess}' = SHA256(messageDigest)$. If $H_{mess}' == H_{mess}$, the contract is authentic.
	- The key pair ($PK_{docuSign}, VK_{docuSign}$) is certified by CAs belonging to the AATL (Adobe Approved Trust List).
## 1.3. The problem:
- There are several methods to verify whether a document has been signed by DocuSign:
	- Using security code to search this document in docuSign server.
	- Pdf reader (such as  Foxit, Adobe Acrobat,...) can automatically verify this document via certificate attached with document.
- However, current verification methods require **full disclosure of the contract content**.

$\Rightarrow$ **The Challenge**: How can we verify that a document was signed and guaranteed by DocuSign without revealing its entire content? Once verified, how can we disclose only a specific portion of the document while proving to a third party that this public snippet belongs to the DocuSign-signed contract?
# 2. Proposed Approach:
## 2.1. Prove the document been signed DocuSign.Inc:
- We can make the DocuSign certificate public without compromising the document's sensitive data. The certificate contains the $PK_{docuSign}$ authenticated by CAs. We provide Party A with:
- We provide party A with:
	- $H_{mess} = SHA256(messageDigest)$.
	- $Sign_{docuSign} = E_{VK_{docuSign}}(content_{cert}||H_{mess})$.
- Party A easily:
	- Party A decrypts the signature using $PK_{docuSign}$ to get $H_{mess}^{'}=D_{PK_{docuSign}}(Sign_{docuSign})$.
	- Verify $H_{mess}' == H_{mess}$ to confirm the hash was signed by DocuSign.
- **Question**: How to party $A$ can believe that $H_{mess}$ is an ouput by hashing entire pdf file?

$\Rightarrow$ Write a Zero-Knowledge Proof (ZKP) to prove that $H_{mess}$ was indeed generated from the full content of the PDF file.
## 2.2. Prove that certain content is present in a PDF file:
- Idea:
	- Partition the document into Private Content (hidden) and Public Content (disclosed).
	- The initial hash $H$ is calculated based on the PDF structure.
	- Let $H^{''}=SHA256(\text{private content} || \text{public content})$.


$\Rightarrow$  Generate a proof $\pi$ to demonstrate that $H'' == H_{mess}$. This proves that the private content exists within the PDF file without actually revealing it.

