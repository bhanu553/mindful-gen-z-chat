
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: {
          shape?: string;
          color?: string;
          layout?: string;
          label?: string;
        };
        createOrder?: (data: any, actions: any) => Promise<string>;
        onApprove?: (data: any, actions: any) => Promise<void>;
        onError?: (err: any) => void;
        onCancel?: (data: any) => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export {};
