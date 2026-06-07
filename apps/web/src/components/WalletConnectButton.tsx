import { AccountBalanceWallet } from '@mui/icons-material';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Chip, Menu, MenuItem, Stack } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { shortenAddress, toAddressString } from '@/features/wallet/address';

export function WalletConnectButton() {
  const { connect, disconnect, connected, account, wallets } = useWallet();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (connected && account) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          color="success"
          variant="outlined"
          label={shortenAddress(toAddressString(account.address))}
          sx={{ color: 'inherit', borderColor: 'currentColor' }}
        />
        <Button color="inherit" variant="outlined" onClick={() => void disconnect()}>
          {t('wallet.disconnect')}
        </Button>
      </Stack>
    );
  }

  const handleSelect = (name: string) => {
    setAnchorEl(null);
    connect(name);
  };

  return (
    <>
      <Button
        color="inherit"
        variant="outlined"
        startIcon={<AccountBalanceWallet />}
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
      >
        {t('wallet.connect')}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {wallets && wallets.length > 0 ? (
          wallets.map((wallet) => (
            <MenuItem key={wallet.name} onClick={() => handleSelect(wallet.name)}>
              {wallet.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>{t('wallet.noWallets')}</MenuItem>
        )}
      </Menu>
    </>
  );
}
