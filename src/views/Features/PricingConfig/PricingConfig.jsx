import React from 'react'
import { IndianRupee } from 'lucide-react'

/* ─────────────────────────────────────────────
   DEFAULT PRICING CONFIGURATION
   Mirrors the backend pricing-config defaults.
   Overridden at runtime by fetching /pricing-config
───────────────────────────────────────────── */
export const DEFAULT_PRICING = {
  basePrice: 1200,       // flat fee for first slot (0 – baseSlotSize students)
  baseSlotSize: 100,     // how many students are included in the base price
  extraBlockSize: 50,    // students per extra block
  extraBlockPrice: 100,  // price per extra block
}

/* ─────────────────────────────────────────────
   calculatePrice
   Pure utility – slot-based pricing logic.

   @param {number} studentCount
   @param {object} config  – shape: { basePrice, baseSlotSize, extraBlockSize, extraBlockPrice }
   @returns {number} total amount (₹)
───────────────────────────────────────────── */
export function calculatePrice(studentCount, config = {}) {
  const {
    basePrice      = DEFAULT_PRICING.basePrice,
    baseSlotSize   = DEFAULT_PRICING.baseSlotSize,
    extraBlockSize = DEFAULT_PRICING.extraBlockSize,
    extraBlockPrice= DEFAULT_PRICING.extraBlockPrice,
  } = config || {}

  const count = Math.max(0, Number(studentCount) || 0)

  if (count <= baseSlotSize) return basePrice

  const extraStudents = count - baseSlotSize
  const extraBlocks   = Math.ceil(extraStudents / extraBlockSize)
  return basePrice + extraBlocks * extraBlockPrice
}

/* ─────────────────────────────────────────────
   resolveAmount
   Resolves the final billing amount for a plan.

   • If the plan has a fixed price (non-student-based), use it directly.
   • Otherwise fall back to calculatePrice with the live student count.

   @param {object|null} plan          – subscription plan document
   @param {number}      studentCount
   @param {object}      pricingConfig – pricing-config from backend
   @returns {number} total amount (₹)
───────────────────────────────────────────── */
export function resolveAmount(plan, studentCount, pricingConfig = {}) {
  if (!plan) return calculatePrice(studentCount, pricingConfig)

  // Plans with a fixed price (e.g., Annual flat-fee plans)
  if (plan.isFixedPrice || plan.planPricingType === 'fixed') {
    return Number(plan.price) || 0
  }

  // Plans that override the per-student price
  if (plan.pricePerStudent && Number(plan.pricePerStudent) > 0) {
    const count = Math.max(0, Number(studentCount) || 0)
    return count * Number(plan.pricePerStudent)
  }

  // Default: slot-based pricing
  return calculatePrice(studentCount, pricingConfig)
}

/* ─────────────────────────────────────────────
   PriceBreakdown  (React component)
   Displays a readable breakdown of slot-based
   pricing for a given student count.

   Props:
     studentCount  {number}
     pricingConfig {object}
     selectedPlan  {object|null}  – if provided, show plan name + fixed price
───────────────────────────────────────────── */
export const PriceBreakdown = ({ studentCount, pricingConfig = {}, selectedPlan }) => {
  const {
    basePrice      = DEFAULT_PRICING.basePrice,
    baseSlotSize   = DEFAULT_PRICING.baseSlotSize,
    extraBlockSize = DEFAULT_PRICING.extraBlockSize,
    extraBlockPrice= DEFAULT_PRICING.extraBlockPrice,
  } = pricingConfig || {}

  const count = Math.max(0, Number(studentCount) || 0)
  const total = resolveAmount(selectedPlan, count, pricingConfig)

  if (!count) return null

  // Fixed-price plan — simple display
  if (selectedPlan && (selectedPlan.isFixedPrice || selectedPlan.planPricingType === 'fixed')) {
    return (
      <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
        <div className="flex items-center gap-1 font-semibold mb-0.5">
          <IndianRupee size={11} /> Price Breakdown
        </div>
        <div className="flex justify-between">
          <span>{selectedPlan.name} (fixed price)</span>
          <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    )
  }

  const extraStudents = Math.max(0, count - baseSlotSize)
  const extraBlocks   = extraStudents > 0 ? Math.ceil(extraStudents / extraBlockSize) : 0
  const extraCharge   = extraBlocks * extraBlockPrice

  return (
    <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
      <div className="flex items-center gap-1 font-semibold mb-1">
        <IndianRupee size={11} /> Price Breakdown
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Base price (up to {baseSlotSize} students)</span>
          <span>₹{basePrice.toLocaleString('en-IN')}</span>
        </div>
        {extraBlocks > 0 && (
          <div className="flex justify-between text-blue-600">
            <span>
              +{extraStudents} extra students
              <span className="text-blue-400 ml-1">
                ({extraBlocks} block{extraBlocks > 1 ? 's' : ''} × ₹{extraBlockPrice})
              </span>
            </span>
            <span>+₹{extraCharge.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1">
          <span>Total</span>
          <span className="text-[#0c3b73]">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

export default { calculatePrice, resolveAmount, DEFAULT_PRICING, PriceBreakdown }
