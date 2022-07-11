import { ConditionalExpr } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { interval } from "rxjs";
// import 'rxjs/add/observable/interval';
import Web3 from "web3";
import { abi, approveABI } from "../../helpers/helper";
const contractAbi = require("src/contracts/contract.abi.json");
import { StorageService } from "../../services/storage.service";

const web3 = new Web3((window as { [key: string]: any })["ethereum"] as string);

@Component({
  selector: "app-stake",
  templateUrl: "./stake.component.html",
  styleUrls: ["./stake.component.css"],
})
export class StakeComponent implements OnInit {
  viewMode = "onGoing";
  showPoolInfo = true;
  depositToken = 100;
  isApproveContractShown = false;
  isConfirmationShown = false;
  isUploadShown = false;
  public contract: any;
  public approve: any;
  public approveContract: any;
  public poolLength: number = 0;
  public contractAddress: string = "0xF395f96913dCd9e3AEEbBb8d82eE47F5A3ACc4c8";
  public approveAddress: string = "0x2811dE52B41267D6FD126B4F8d0ac2248E1C9624";
  poolsOngoing: any = [];
  tpoolsOngoing: any = [];
  poolsUpcoming: any = [];
  poolsClaim: any = [];
  poolsCompleted: any = [];
  poolsMyDeal: any = [];
  activeIndex: number = -1;
  showLive: any = false;
  // dealsId: any = 0;
  countDown: any = [];

  constructor(private storagService: StorageService) {}

  async ngOnInit() {
    // this.web3Service.connect();
    // console.log(contractAbi);

    this.contract = await new web3.eth.Contract(abi, this.contractAddress);
    // console.log(this.contract);

    await this.setPoolLength();
    await this.createPath();
    const obs$ = await interval(2000);
    obs$.subscribe((d) => {
      this.transform(1, 1);
    });

  }
  async createPath(){
    for (let i = 0; i < this.poolLength; i++) {
      var nm = 2
       var count = this.countDown.push(nm)
        // console.log(count)
    }
  }
  async calculateTime() {
    for (let i = 0; i < this.poolLength; i++) {
      const userInfo = await this.contract.methods
        .userInfo(i, localStorage.getItem("connecttedAddress"))
        .call({ from: localStorage.getItem("connecttedAddress") });

      const poolInfo = await this.contract.methods.poolInfo(i).call();
    }
  }
  async transform(i: number, id) {
    for (let i = 0; i < this.poolLength; i++) {
      var stakedAmount = await this.contract.methods
        .getUserStakedTokenInPool(i)
        .call({ from: localStorage.getItem("connecttedAddress") });
      // console.log(stakedAmount);
      const userInfo = await this.contract.methods
        .userInfo(i, localStorage.getItem("connecttedAddress"))
        .call({ from: localStorage.getItem("connecttedAddress") });
      const poolInfo = await this.contract.methods.poolInfo(i).call();
      var currentTime = await Math.floor(Date.now() / 1000);
      let future: any = new Date(userInfo.stakingEndTime * 1000);
      let now: any = new Date();
      let diff = future - now;

      let days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let hours = Math.floor(diff / (1000 * 60 * 60));
      let mins = Math.floor(diff / (1000 * 60));
      let secs = Math.floor(diff / 1000);

      let d = days;
      let h = hours - days * 24;
      let m = mins - hours * 60;
      let s = secs - mins * 60;
      // console.log(d + ":" + h + ":" + m + ":" + s);

      var stakedAmount = await this.contract.methods
        .getUserStakedTokenInPool(i)
        .call({ from: localStorage.getItem("connecttedAddress") });
      // console.log(stakedAmount);
        this.upDateCountDown(stakedAmount,userInfo,currentTime,i,d,h,m,s)
    }
  }
  async upDateCountDown(stakedAmount,userInfo,currentTime,i,d,h,m,s){
    if (stakedAmount > 0 && userInfo.stakingEndTime < currentTime) {
      this.countDown[i] = "Please Claim The Reward";
    } else if (stakedAmount == 0) {
      this.countDown[i] = "Not Yet Staked";
    } else {
      this.countDown[i] = d + ":" + h + ":" + m + ":" + s;
    }
  }
  public async setPoolLength() {
    this.poolLength = await this.contract.methods.poolLength().call();
    // console.log(this.poolLength);
    this.syncPool();
  }
  /**
   * on toggle between live/completed
   * @param{string}sectionName
   */
  public onToggle(sectionName: string) {
    this.viewMode = sectionName;
    this.viewMode === "onGoing"
      ? (this.showLive = true)
      : (this.showLive = false);
    // console.log(this.showLive);
  }

  public async syncPool() {
    for (let i = 0; i < this.poolLength; i++) {
      const poolInfo = await this.contract.methods.poolInfo(i).call();
      const stakedInpoolInfo = await this.contract.methods
        .getTotalStakedInPool(i)
        .call();
      const userInfo = await this.contract.methods
        .userInfo(i, localStorage.getItem("connecttedAddress"))
        .call({ from: localStorage.getItem("connecttedAddress") });
      // console.log("userINfo", userInfo);
      // console.log("poolInfo", poolInfo);
      this.calaculation(poolInfo, userInfo, stakedInpoolInfo, i);
    }
  }

  async calaculation(poolInfo, userInfo, stakedInpoolInfo, _pid) {
    let EndTime = new Date(poolInfo.endTime * 1000);
    let startTime = new Date(poolInfo.startTime * 1000);
    poolInfo.readableEndTime =
      EndTime.getDate() +
      "/" +
      EndTime.getMonth() +
      "/" +
      EndTime.getFullYear() +
      " , " +
      EndTime.getHours() +
      ":" +
      EndTime.getMinutes() +
      ":" +
      EndTime.getSeconds();
    poolInfo.readableStartTime =
      startTime.getDate() +
      "/" +
      startTime.getMonth() +
      "/" +
      startTime.getFullYear() +
      " , " +
      startTime.getHours() +
      ":" +
      startTime.getMinutes() +
      ":" +
      startTime.getSeconds();
    let lockPeriodSec = poolInfo.duration * 60;
    var d = Math.floor(lockPeriodSec / (3600 * 24));
    var h = Math.floor((lockPeriodSec % (3600 * 24)) / 3600);
    var m = Math.floor((lockPeriodSec % 3600) / 60);
    var s = Math.floor(lockPeriodSec % 60);
    poolInfo.lockPeriod = d + "d: " + h + "h: " + m + "m: " + s;
    poolInfo.stakebleAmount = (await poolInfo.poolStakableAmount) / 10 ** 18;
    poolInfo.stakedInPool = (await stakedInpoolInfo) / 10 ** 18;
    poolInfo.stakedPercentage =
      (await (poolInfo.stakedInPool / poolInfo.stakebleAmount)) * 100;
    // console.log(poolInfo.duration);
    var currentTime = await Math.floor(Date.now() / 1000);
    // console.log(currentTime);
    // console.log(poolInfo.endTime);
    var stakedAmount = await this.contract.methods
      .getUserStakedTokenInPool(_pid)
      .call({ from: localStorage.getItem("connecttedAddress") });
    // console.log(stakedAmount);
    poolInfo.userStakedAmount = stakedAmount / 10 ** 18;
    let userStakeEndTime = new Date(userInfo.stakingEndTime * 1000);
    // poolInfo.countDown = 0
    poolInfo.userStakeEndTime =
      userStakeEndTime.getDate() +
      "/" +
      userStakeEndTime.getMonth() +
      "/" +
      userStakeEndTime.getFullYear() +
      " , " +
      userStakeEndTime.getHours() +
      ":" +
      userStakeEndTime.getMinutes() +
      ":" +
      userStakeEndTime.getSeconds();
    poolInfo.userExpectedReward = userInfo.expectedReward / 10 ** 18;
    poolInfo.poolId = _pid;

    if (currentTime > poolInfo.endTime && currentTime > poolInfo.startTime) {
      this.poolsCompleted.push(poolInfo);
      poolInfo["poolsStatus"] = "completed";

      // console.log("completed");
    } else if (
      currentTime < poolInfo.startTime &&
      currentTime < poolInfo.endTime
    ) {
      this.poolsUpcoming.push(poolInfo);
      poolInfo["poolsStatus"] = "upcoming";

      // console.log("upcoming");
    } else if (
      currentTime < poolInfo.endTime &&
      currentTime > poolInfo.startTime
    ) {
      this.poolsOngoing.push(poolInfo);
      // console.log("Ongoing");
      poolInfo["poolsStatus"] = "ongoing";
    }

    if (stakedAmount > 0) {
      this.poolsMyDeal.push(poolInfo);
    }
    if (userInfo.isStaking && userInfo.stakingEndTime < currentTime) {
      this.poolsClaim.push(poolInfo);
    }
  }

  async stakeToken(_pid: any) {
    this.contract = new web3.eth.Contract(abi, this.contractAddress);
    this.approveContract = new web3.eth.Contract(
      approveABI,
      this.approveAddress
    );
    // console.log(_pid);
    let approveToken = await this.approveContract.methods
      .approve(this.contractAddress, BigInt(this.depositToken * 10 ** 18))
      .send({ from: localStorage.getItem("connecttedAddress") })
      .then((receipt) => {
        // console.log(receipt);
      });
    let stakeToken = await this.contract.methods
      .stakeTokens(_pid, BigInt(this.depositToken * 10 ** 18))
      .send({ from: localStorage.getItem("connecttedAddress") })
      .then((receipt) => {
        // console.log(receipt);
      });
  }

  async ClaimToken(_pid) {
    let claimToken = await this.contract.methods
      .withdrawAll(_pid)
      .send({ from: localStorage.getItem("connecttedAddress") })
      .then((receipt) => {
        // console.log(receipt);
      });
  }
  togglePoolInfo() {
    this.showPoolInfo = !this.showPoolInfo;
  }
  openContractModal() {
    this.isApproveContractShown = true;
  }
  closeContractModal() {
    this.isApproveContractShown = false;
  }
  openConfirmation() {
    this.isConfirmationShown = true;
    setTimeout(() => {
      this.isConfirmationShown = false;
      this.isUploadShown = true;
    }, 1000);
  }
  closeConfirmation() {
    this.isUploadShown = false;
  }
}
