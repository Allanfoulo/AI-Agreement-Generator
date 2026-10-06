# Mobile Wallet Payment Methods for Brief Doc X

## Goal

Allow a business to save mobile-wallet receiving details in Company Profile and choose, per quote or invoice, whether the issued document shows no payment details, bank transfer details, mobile-wallet details, or both.

The feature must support mobile-money workflows common in markets such as Lesotho without forcing payment details onto every document or inventing wallet information.

## Approved approach

Use a payment-method selector on each quote or invoice:

- No payment details (default)
- Bank transfer
- Mobile wallet
- Bank transfer + mobile wallet

Existing document behavior remains unchanged unless a new payment method is selected. Older documents without the new field are treated as `none`.

## Data model

Extend the company profile with optional mobile-wallet fields:

- `mobileWalletProvider`
- `mobileWalletNumber`
- `mobileWalletName`

Extend document content with an optional `paymentMethod` field. Valid values are `none`, `bank`, `mobile_wallet`, and `bank_and_mobile_wallet`.

The field is optional in validators so existing documents remain readable. New documents default to `none`.

When a document is issued, the selected payment method and the complete company profile are copied into the immutable version snapshot. Later profile edits must not change already-issued artifacts.

## Company Profile UI

Add a Mobile Wallet subsection directly below Banking Details with:

- Provider/network
- Wallet mobile number
- Wallet account name

Helper text should explain that the account name is the recipient name returned by the wallet service and should be confirmed before payment. No wallet PIN, password, or transaction credential is stored.

## Quote and invoice UI

Add a Payment Details selector to the document builder for quotes and invoices. The selector controls the issued document only; it does not change the company profile.

When a wallet-containing option is selected, the UI should show a compact preview of the wallet details and identify missing fields before save/issue. When a bank-containing option is selected, bank details should be validated before issue.

Payment-method selection should be restored when editing a draft and preserved when converting an accepted quote into an invoice.

## Validation and safety

- `none` requires no banking or wallet fields.
- `bank` requires the minimum bank details needed by the existing document format.
- `mobile_wallet` requires provider, number, and wallet account name.
- `bank_and_mobile_wallet` requires both sets of details.
- The issue mutation remains authoritative and repeats these checks server-side.
- The displayed wallet account name is a confirmation aid; Brief Doc X must not claim that it verified the name with a wallet provider.

## PDF output

For quotes and invoices with a wallet-containing payment method, render a clearly labelled Mobile Wallet payment block containing the provider, number, and account name, followed by a short instruction to confirm the recipient name in the wallet app before paying.

For bank-containing methods, render the existing bank details in the same payment-details area. For `none`, render no payment block.

The block should work across modern, corporate, and minimal templates without exposing banking details in other document types.

## Compatibility and testing

- Existing workspace rows and documents must remain valid when wallet fields are blank and `paymentMethod` is absent.
- Add domain/validator tests for all four payment-method values and incomplete details.
- Add a backend issue test proving invalid payment details cannot be issued.
- Add render-model/template coverage for wallet-only and combined payment blocks.
- Run the Convex one-shot sync, production frontend build, and existing test suite.

