import {
  calculateLineItemAmount,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateAmountDue,
  generateInvoiceNumber,
  generateEstimateNumber,
  generateUniqueId,
} from '../invoice-calculations';
import { Invoice } from '../../types';
import { Estimate } from '../../../estimates/types';

describe('Calculation Functions', () => {
  describe('calculateLineItemAmount', () => {
    it('should calculate line item amount correctly', () => {
      expect(calculateLineItemAmount(2, 100)).toBe(200);
      expect(calculateLineItemAmount(1.5, 50)).toBe(75);
      expect(calculateLineItemAmount(3, 33.33)).toBe(99.99);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateLineItemAmount(3, 10.1234)).toBe(30.37);
    });
  });

  describe('calculateSubtotal', () => {
    it('should sum all line item amounts', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 1, unitPrice: 100, amount: 100 },
        { id: '2', description: 'Item 2', quantity: 2, unitPrice: 50, amount: 100 },
        { id: '3', description: 'Item 3', quantity: 1, unitPrice: 25.50, amount: 25.50 },
      ];
      expect(calculateSubtotal(items)).toBe(225.50);
    });

    it('should return 0 for empty array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax amount correctly', () => {
      expect(calculateTax(100, 10)).toBe(10);
      expect(calculateTax(200, 8.5)).toBe(17);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTax(100, 8.875)).toBe(8.88);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100, 10, 5)).toBe(105);
      expect(calculateTotal(200, 17, 0)).toBe(217);
    });

    it('should handle discount', () => {
      expect(calculateTotal(100, 10, 20)).toBe(90);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTotal(100.1234, 10.5678, 5.1234)).toBe(105.57);
    });
  });

  describe('calculateAmountDue', () => {
    it('should calculate amount due correctly', () => {
      expect(calculateAmountDue(100, 0)).toBe(100);
      expect(calculateAmountDue(100, 50)).toBe(50);
      expect(calculateAmountDue(100, 100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateAmountDue(100.1234, 50.5678)).toBe(49.56);
    });
  });
});

describe('ID Generation Functions', () => {
  describe('generateInvoiceNumber', () => {
    it('should return INV-YYYY-0001 for empty array', () => {
      const year = new Date().getFullYear();
      const result = generateInvoiceNumber([]);
      expect(result).toBe(`INV-${year}-0001`);
    });

    it('should return next sequential number with existing invoices', () => {
      const year = new Date().getFullYear();
      const invoices: Invoice[] = [
        {
          id: 'inv-1',
          invoiceNumber: `INV-${year}-0001`,
          status: 'paid',
          clientId: 'client-1',
          clientName: 'Client 1',
          clientEmail: 'client1@example.com',
          issueDate: '2026-01-01',
          dueDate: '2026-01-31',
          lineItems: [],
          subtotal: 100,
          taxAmount: 10,
          discount: 0,
          total: 110,
          amountPaid: 110,
          amountDue: 0,
          currency: 'USD',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'inv-2',
          invoiceNumber: `INV-${year}-0002`,
          status: 'paid',
          clientId: 'client-2',
          clientName: 'Client 2',
          clientEmail: 'client2@example.com',
          issueDate: '2026-01-02',
          dueDate: '2026-02-01',
          lineItems: [],
          subtotal: 200,
          taxAmount: 20,
          discount: 0,
          total: 220,
          amountPaid: 220,
          amountDue: 0,
          currency: 'USD',
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ];
      const result = generateInvoiceNumber(invoices);
      expect(result).toBe(`INV-${year}-0003`);
    });

    it('should handle deletion - return 0004 when 0001 and 0003 exist (critical regression test)', () => {
      const year = new Date().getFullYear();
      const invoices: Invoice[] = [
        {
          id: 'inv-1',
          invoiceNumber: `INV-${year}-0001`,
          status: 'paid',
          clientId: 'client-1',
          clientName: 'Client 1',
          clientEmail: 'client1@example.com',
          issueDate: '2026-01-01',
          dueDate: '2026-01-31',
          lineItems: [],
          subtotal: 100,
          taxAmount: 10,
          discount: 0,
          total: 110,
          amountPaid: 110,
          amountDue: 0,
          currency: 'USD',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        // INV-0002 was deleted
        {
          id: 'inv-3',
          invoiceNumber: `INV-${year}-0003`,
          status: 'paid',
          clientId: 'client-3',
          clientName: 'Client 3',
          clientEmail: 'client3@example.com',
          issueDate: '2026-01-03',
          dueDate: '2026-02-02',
          lineItems: [],
          subtotal: 300,
          taxAmount: 30,
          discount: 0,
          total: 330,
          amountPaid: 330,
          amountDue: 0,
          currency: 'USD',
          createdAt: '2026-01-03T00:00:00Z',
          updatedAt: '2026-01-03T00:00:00Z',
        },
      ];
      const result = generateInvoiceNumber(invoices);
      // Should be 0004, NOT 0003 (which would collide)
      expect(result).toBe(`INV-${year}-0004`);
    });

    it('should only consider invoices from current year', () => {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      const invoices: Invoice[] = [
        {
          id: 'inv-old',
          invoiceNumber: `INV-${lastYear}-0099`,
          status: 'paid',
          clientId: 'client-old',
          clientName: 'Old Client',
          clientEmail: 'old@example.com',
          issueDate: `${lastYear}-12-31`,
          dueDate: `${lastYear}-12-31`,
          lineItems: [],
          subtotal: 100,
          taxAmount: 10,
          discount: 0,
          total: 110,
          amountPaid: 110,
          amountDue: 0,
          currency: 'USD',
          createdAt: `${lastYear}-12-31T00:00:00Z`,
          updatedAt: `${lastYear}-12-31T00:00:00Z`,
        },
      ];
      const result = generateInvoiceNumber(invoices);
      expect(result).toBe(`INV-${currentYear}-0001`);
    });
  });

  describe('generateEstimateNumber', () => {
    it('should return EST-YYYY-0001 for empty array', () => {
      const year = new Date().getFullYear();
      const result = generateEstimateNumber([]);
      expect(result).toBe(`EST-${year}-0001`);
    });

    it('should return next sequential number with existing estimates', () => {
      const year = new Date().getFullYear();
      const estimates: Estimate[] = [
        {
          id: 'est-1',
          estimateNumber: `EST-${year}-0001`,
          status: 'sent',
          clientId: 'client-1',
          clientName: 'Client 1',
          clientEmail: 'client1@example.com',
          issueDate: '2026-01-01',
          expiryDate: '2026-01-31',
          lineItems: [],
          subtotal: 100,
          taxAmount: 10,
          discount: 0,
          total: 110,
          currency: 'USD',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'est-2',
          estimateNumber: `EST-${year}-0002`,
          status: 'accepted',
          clientId: 'client-2',
          clientName: 'Client 2',
          clientEmail: 'client2@example.com',
          issueDate: '2026-01-02',
          expiryDate: '2026-02-01',
          lineItems: [],
          subtotal: 200,
          taxAmount: 20,
          discount: 0,
          total: 220,
          currency: 'USD',
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ];
      const result = generateEstimateNumber(estimates);
      expect(result).toBe(`EST-${year}-0003`);
    });

    it('should handle deletion - return 0004 when 0001 and 0003 exist (critical regression test)', () => {
      const year = new Date().getFullYear();
      const estimates: Estimate[] = [
        {
          id: 'est-1',
          estimateNumber: `EST-${year}-0001`,
          status: 'sent',
          clientId: 'client-1',
          clientName: 'Client 1',
          clientEmail: 'client1@example.com',
          issueDate: '2026-01-01',
          expiryDate: '2026-01-31',
          lineItems: [],
          subtotal: 100,
          taxAmount: 10,
          discount: 0,
          total: 110,
          currency: 'USD',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        // EST-0002 was deleted
        {
          id: 'est-3',
          estimateNumber: `EST-${year}-0003`,
          status: 'accepted',
          clientId: 'client-3',
          clientName: 'Client 3',
          clientEmail: 'client3@example.com',
          issueDate: '2026-01-03',
          expiryDate: '2026-02-02',
          lineItems: [],
          subtotal: 300,
          taxAmount: 30,
          discount: 0,
          total: 330,
          currency: 'USD',
          createdAt: '2026-01-03T00:00:00Z',
          updatedAt: '2026-01-03T00:00:00Z',
        },
      ];
      const result = generateEstimateNumber(estimates);
      // Should be 0004, NOT 0003 (which would collide)
      expect(result).toBe(`EST-${year}-0004`);
    });
  });

  describe('generateUniqueId', () => {
    it('should return string with correct prefix', () => {
      const id = generateUniqueId('inv');
      expect(id).toMatch(/^inv-\d+-[a-z0-9]{5}$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const id1 = generateUniqueId('pay');
      const id2 = generateUniqueId('pay');
      expect(id1).not.toBe(id2);
    });

    it('should work with different prefixes', () => {
      const invId = generateUniqueId('inv');
      const estId = generateUniqueId('est');
      const payId = generateUniqueId('pay');
      
      expect(invId.startsWith('inv-')).toBe(true);
      expect(estId.startsWith('est-')).toBe(true);
      expect(payId.startsWith('pay-')).toBe(true);
    });
  });
});
