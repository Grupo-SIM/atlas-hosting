declare module 'react-payment-inputs' {
  export interface UsePaymentInputsOptions {
    onCardNumberChange?: (cardNumber: string) => void;
    onExpiryDateChange?: (expiryDate: string) => void;
    onCVCChange?: (cvc: string) => void;
  }

  export interface UsePaymentInputsReturn {
    meta: {
      cardType?: {
        displayName: string;
        type: string;
      };
      error?: string;
      focused?: string;
      erroredInputs?: string[];
      touchedInputs?: string[];
    };
    getCardNumberProps: () => {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      value: string;
      placeholder?: string;
    };
    getExpiryDateProps: () => {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      value: string;
      placeholder?: string;
    };
    getCVCProps: () => {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      value: string;
      placeholder?: string;
    };
    getCardImageProps: () => {
      src?: string;
      alt?: string;
    };
    wrapperProps?: any;
  }

  export function usePaymentInputs(options?: UsePaymentInputsOptions): UsePaymentInputsReturn;
}

declare module 'react-payment-inputs/images' {
  const images: any;
  export default images;
  export type CardImages = any;
}
