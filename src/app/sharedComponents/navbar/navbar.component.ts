import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { ContractService } from '../../services/contract.service';
import { Router } from '@angular/router';

// Connect Wallet
import Web3 from 'web3';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

// Set web3 and connector
const web3 = new Web3(window['ethereum']);
const connector = new WalletConnect({
  bridge: 'https://bridge.walletconnect.org',
});

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  connector: any;
  ethereum: any;
  account: any = {};
  

  constructor(
    private contractService: ContractService,
    private storageService: StorageService,
    private router: Router
  ) {}
  showMobileMenu = false;
  toggleNavbar() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  ngOnInit(): void {
    this.account =
      this.storageService.getItem('account') === null
        ? { address: '', network: '', chainId: '', provider: '' }
        : JSON.parse(this.storageService.getItem('account') || '{}');
        this.account.address="ConnectWallet"
    // this.setAccount(this.account.address, this.account.chainId, this.account.provider);
  }

  // Meta mask connection
  openMetamask = async () => {
    this.ethereum = window['ethereum'];
    if (typeof this.ethereum !== 'undefined') {
    }
    const accounts = await this.ethereum.request({
      method: 'eth_requestAccounts',
    });
    this.setAccount(accounts[0], this.ethereum.chainId, 'metamask');
    this.metamastListener();
    // window.location.reload();
  };

  public metamastListener() {
    // Listener
    this.ethereum.on('accountsChanged', (accounts) => {
      this.setAccount(accounts[0], this.ethereum.chainId, 'metamask');
    });
    this.ethereum.on('chainChanged', (chainId) => {
      this.setAccount(this.account.address, chainId, 'metamask');
    });
    this.storageService.setItem('walletconnect', '');
  }

  connectWallet = async () => {
    // Create a connector
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });
    // Check if connection is already established
    if (!this.connector.connected) {
      // create new session
      this.connector.createSession();
    }
    this.wallectConnectListener();
  };
  public wallectConnectListener() {
    // Subscribe to connection events
    this.connector.on('connect', (error, payload) => {
      // window.location.reload();
      if (error) {
        throw error;
      }
      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setAccount(accounts[0], chainId, 'trustwallet');
    });
    this.connector.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setAccount(accounts[0], chainId, 'trustwallet');
    });

    this.connector.on('disconnect', (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
      this.setAccount(' ', ' ', ' ');
    });
  }

  public async setAccount(address, chainId, provider) {
    let account;
    if (address != '' && address != undefined) {
      const { network, key } = await this.setNetwork(chainId);
      account = {
        address: address,
        chainId: chainId,
        network,
        key,
        provider: provider,
      };
    } else {
      account = {
        address: '',
        network: '',
        chainId: '',
        provider: '',
        key: '',
      };
    }
    this.contractService.setAccount(account);
    this.account = Object.assign({}, account);
    this.storageService.setItem('account', JSON.stringify(this.account));
    this.storageService.setItem('connecttedAddress',this.account.address)
  }

  public setNetwork(chainId) {
    let network;
    let key;
    switch (chainId) {
      case '0x1':
      case 1:
        network = 'Mainnet';
        key = 'ETH';
        break;
      case '0x3':
      case 3:
        network = 'Ropsten';
        key = 'ETH';
        break;
      case '0x4':
      case 4:
        network = 'Rinkeby';
        key = 'ETH';
        break;
      case '0x38':
      case 56:
        network = 'BSC Mainnet';
        key = 'BSC';
        break;
      case '0x61':
      case 97:
        network = 'BSC Testnet';
        key = 'BSC';
        break;
      default:
        network = 'Unknown';
        break;
    }
    return { network, key };
  }
}
function enableDarkTheme() {
  throw new Error('Function not implemented.');
}
