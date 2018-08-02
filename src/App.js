import React, {Component} from 'react';
import {Message,Container,Card,Image,Icon,Button,Statistic,Label} from 'semantic-ui-react'
import web3 from './web3'
import lottery from './lottery';

class App extends Component {
    //数据初始化
    state={
            mannager:'',
            balance:0,
            playesCount:0,
            loading:false,
            pickLoading:false,
            refundLoading:false,
            showbutton:'none'
    };
    //在页面加载完之前准备好数据
    async componentDidMount(){
        const address = await lottery.methods.getManager().call();
        console.log('管理员账户地址：'+address);//当前网页上的用户钱包地址
        const players = await lottery.methods.getPlayers().call();
        const balance = await lottery.methods.getBalance().call();
        this.setState({
            manager:address,
            playesCount:players.length,
            balance:web3.utils.fromWei(balance,'ether'),
        });
        const visitorAccounts = await  web3.eth.getAccounts();  //获取当前访问的账户地址
        if (address === visitorAccounts[0]){
            this.setState({showbutton:'inline'})   //当前访问是管理员则显示开奖和退款按钮
        }else{
            this.setState({showbutton:'none'})  //当前访问是参与者,则隐藏开奖和退款按钮
        }
    }
    //投注彩票
    enter = async ()=>{
        this.setState({loading:true});  //点击按钮的时候显示正在处理的提示
        const accounts = await web3.eth.getAccounts();   //获取账户
        //拿着彩票智能合约调用enter方法
        await lottery.methods.enter().send({
            from:accounts[0],
            value:'1000000000000000000'
        });
        this.setState({
            loading:false,
        });
        window.location.reload(true);
    };
    //管理员执行开奖
    pickWinner = async ()=>{
        this.setState({pickLoading:true});
        const accounts = await web3.eth.getAccounts();//获取账户（管理员）
        //拿着彩票智能合约调用pickWinner方法
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });
        this.setState({pickLoading:false});
        window.location.reload(true);
    };
    //管理员执行退款
    refund = async ()=>{
        this.setState({loading:true});
        await lottery.methods.refund().send({
            from: '0x61219B6AFC5d7eC874Dcd9298262ea7994ec629C'
        });
        this.setState({loading:false});
        window.location.reload(true);
    };
    //渲染页面
    render() {
        return (
            <div>
                <Container>
                    <Card  style={{marginTop:10}}>
                    <Message info>
                        <Message.Header>以太坊彩票</Message.Header>
                        <p>博一博，单车变摩托</p>
                    </Message>
                        <Image src='/images/logo.jpg' />
                        <Card.Content>
                            <Card.Header>管理员地址</Card.Header>
                            <Card.Meta>
                                <Label size='mini'>{this.state.manager}</Label>
                            </Card.Meta>
                            <Card.Description>每周五晚上8:30开奖</Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <a><Icon name='user' />已有{this.state.playesCount}人购买</a>
                        </Card.Content>
                        <Card.Content extra >
                            <Statistic color='red' inverted style={{justifyContent:'center',alignItems:'center'}}>
                                <Statistic.Value>{this.state.balance}ether</Statistic.Value>
                                <p>奖池金额</p>
                            </Statistic>
                        </Card.Content>
                    <Button animated='fade' onClick={this.enter} loading={this.state.loading} disabled={this.state.loading}>
                        <Button.Content visible>购买一注</Button.Content>
                        <Button.Content hidden>变成首富！</Button.Content>
                    </Button>
                    <Button positive loading={this.state.pickLoading} disabled={this.state.pickLoading} style={{display:this.state.showbutton}} onClick={this.pickWinner}>开奖</Button>
                    <Button negative loading={this.state.refundLoading} disabled={this.state.refundLoading} style={{display:this.state.showbutton}} onClick={this.refund}>退款</Button>
                    </Card>
                </Container>
            </div>
        );
    }
}

export default App;
