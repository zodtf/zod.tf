# SpookyTF Trading DB and Structure Planning 

----

# [`dkasabov`](https://github.com/dkasabovn) saves the day
welcome to the microservice master, the `GoLang` Gopher himself, 

> some guy named ~~daniel~~ David !!!!!!

---

# Login 
User Login uses Steam `OAuth2` with MongoDB currently -- DB may change but flow is simple

\+ add a `user_service` for this process
    - user lands, steam oauth
	- steamid as pk, 
> if exists, 
	return as `req.user` and `redirect('/')`

> else 
>   // prompt for trade URL
> `display(tradeOfferURL view, {user: req.user})`   
> if they open another tab and go back to spooky.tf
	`displayPopover(noTradeURLSaved, State.REQUIRED)`  

-   > if tradeOffer URL is valid: 
	 `USERS_DB.insert(new User(steamid, tradeOfferURL))` 
-   > else 
	`display(invalidTradeOffer, State.ERROR)`
# Event Manager -> Notification System 

AWS SNS (cheaper): $0.00/1mil, $0.50/1mil after
Kafka   (generic): $30.00/mo EARLY

---

## Databases

### GENERAL
```yml
     OPEN_QUESTIONS:
      - All relational? All NoSQL? Mixture?
      - DBs?
	    - prices
	    - transactions
	    - users
	- 
```

---

### **David Model**

---

**NoSQL**
```yml
DBs:
	- Users
	- Transactions  
```

**SQL**
```yml
BOTNET_DB:
	- Bot(steamid, my_inv[])
	- Trades(uuid as pk, botSteamID, steamID
		*distributed lock for in_trade, (other situations)*  
```

## BOTNET 
_pretending RPC is HTTP for my brain_
```
	RPC API - post(`/trade/request`) 
		      body: {
				... (trade body)
				// type(GK, TK) # (get keys, take keys)
				resources: {
					in[],
					out[]
				}
			  }
			1. `SELECT bots.id FROM bots INNER JOIN bot_inventories  bi WHERE bi.sku IN []`
			2. -- organize items such that one bot has each item --
			3. 
			   -- BEGIN TRANSACTION HERE 
				  `BOTNET_DB.Trades.insert(new Trade(...))`
			      UPDATE bot_inventories bi SET quantity -= WHERE bi.sku IN [] AND bi.bot_fk = bot_id
				    `sendTradeOffer(targetSteamID...)`
					-- if successful trade COMMMIT here -- 
					-- else ROLLBACK -- 
```				
			   
				