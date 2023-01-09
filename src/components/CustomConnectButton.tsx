import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from './Button';

const CustomConnectButton = () => (
  <ConnectButton.Custom>
    {({
      account,
      chain,
      openAccountModal,
      openChainModal,
      openConnectModal,
      authenticationStatus,
      mounted,
    }) => {
      // Note: If your app doesn't use authentication, you
      // can remove all 'authenticationStatus' checks
      const ready = mounted && authenticationStatus !== 'loading';
      const connected =
        ready &&
        account &&
        chain &&
        (!authenticationStatus ||
          authenticationStatus === 'authenticated');

      return connected ? null : (
        <Button onClick={openConnectModal} type="button">
          Connect your wallet
        </Button>
      );
    }}
  </ConnectButton.Custom>
);

export default CustomConnectButton;