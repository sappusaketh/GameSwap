var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/mydb';
var mydb = 'mydb';
/*drop db if exists */
MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, db) {
    db.db(mydb).dropDatabase(function (err, res) {
      if (err) throw err;
      console.log(res);
    });
  }
);
/*db connection*/
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  console.log('Database created!');
  db.close();
});

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  var dbo = db.db(mydb);
  /*item data total count= 9*/
  var allitems = [
    {
      _id: new ObjectId('5bda6a0b3af7352d54aafd08'),
      itemcode: 'item1',
      UserId: 2,
      itemname: 'Counter-Strike (Global Offensive)',
      itemsname: 'Cs-Go',
      catalogcategory: 'FPS games',
      itemby: 'Valve Corporation',
      description:
        'Counter-Strike: Global Offensive (CS:GO) is a multiplayer first-person shooter video game developed by Hidden Path Entertainment and Valve Corporation. CS-GO is one of the most played games on steam',
      detaildescription:
        'It is the fourth game in the Counter-Strike series and was released for Microsoft Windows, OS X, Xbox 360, and PlayStation 3 in August 2012, with the Linux version released in September 2014.The game pits two teams against each other: the Terrorists and the Counter-Terrorists. Both sides are tasked with eliminating the other while also completing separate objectives, the Terrorists, depending on the game mode, must either plant the bomb or defend the hostages, while the Counter-Terrorists must either prevent the bomb from being planted, defuse the bomb, or rescue the hostages. There are eight game modes, all of which have distinct characteristics specific to that mode.',
      rating: 4,
      imgurl: 'resources/images/cs-go.jpeg',
      catalogcategoryurl: 'FPS%20games',
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd34fc7c2596093cb00714'),
      itemcode: 'item2',
      itemsname: 'Tf2',
      catalogcategory: 'FPS games',
      itemname: 'TeamFortress-2',
      UserId: 1,
      itemby: 'Valve Corporation',
      description:
        'Team Fortress 2 is a team-based multiplayer first-person shooter video game developed and published by Valve Corporation.It is the sequel to the 1996 mod Team Fortress for Quake and its 1999 remake, Team Fortress Classic.',
      detaildescription:
        "It was released as part of the video game bundle The Orange Box in October 2007 for Microsoft Windows and the Xbox 360. A PlayStation 3 version followed in December 2007. The game was released for Windows as a standalone entry in April 2008 and was updated to support OS X in June 2010 and Linux in February 2013. It is distributed online through Valve's digital retailer Steam, with retail distribution being handled by Electronic Arts.",
      rating: 4,
      imgurl: '../resources/images/tf2.jpg',
      catalogcategoryurl: 'FPS%20games',
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd35dd7c2596093cb00715'),
      itemcode: 'item3',
      UserId: 1,
      itemname: 'Call of Duty',
      itemsname: 'COD',
      catalogcategory: 'FPS games',
      itemby: 'Activision',
      description:
        'Call of Duty is a first-person shooter video game franchise. The series began on Microsoft Windows, and later expanded to consoles and handhelds. Several spin-off games have been released.',
      detaildescription:
        "Black Ops 4 is the first Call of Duty title without a traditional single-player campaign mode. Instead, it features the Solo Missions mode, which focuses on the backstories of the game's multiplayer characters, known as 'Specialists'. The missions take place between Black Ops II and III chronologically. Some of the Specialists also carried over from Black Ops III. The multiplayer mode is the first in the series to not feature automatic health regeneration and introduces both predictive recoil and a new ballistics system. The game includes three Zombies map on release day, four if a special edition of the game, or the Black Ops Pass, is purchased. The locations of the maps include the RMS Titanic, an arena in Ancient Rome, and Alcatraz Federal Penitentiary. The game also introduces a battle royale mode called Blackout, which features up to 100 players in each match.",
      rating: 3,
      imgurl: '../resources/images/cod.jpg',
      catalogcategoryurl: 'FPS%20games',
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd37697c2596093cb00716'),
      itemcode: 'item4',
      UserId: 2,
      itemname: 'Fortnite',
      itemsname: 'Fortnite',
      catalogcategory: 'Battle royale',
      itemby: 'Epic Games',
      description:
        'Fortnite is an online video game first released in 2017 and developed by Epic Games. It is available as separate software packages having different game modes that otherwise share the same general gameplay and game engine.',
      detaildescription:
        'The game modes include Fortnite: Save the World, a cooperative shooter-survival game for up to four players to fight off zombie-like creatures and defend objects with fortifications they can build, and Fortnite Battle Royale, a free-to-play battle royale game where up to 100 players fight to be the last person standing. Both game modes were released in 2017 as early access titles; Save the World is available only for Microsoft Windows, macOS, PlayStation 4, and Xbox One, while Battle Royale has been released for those platforms in addition for Nintendo Switch, iOS and Android devices.',
      rating: 5,
      imgurl: '../resources/images/fortnite.jpg',
      catalogcategoryurl: 'Battle%20royale',
      itemstatus: 'available',
    },
    {
      _id: new ObjectId('5bdd37ee7c2596093cb00717'),
      itemcode: 'item5',
      UserId: 3,
      itemname: "PlayerUnknown's Battlegrounds",
      itemsname: 'PUBG',
      catalogcategory: 'Battle royale',
      itemby: 'PUBG Corporation',
      description:
        "PlayerUnknown's Battlegrounds is an online multiplayer battle royale game developed and published by PUBG Corporation, a subsidiary of South Korean video game company Bluehole. PUBG is the most played game on steam",
      detaildescription:
        "The game is based on previous mods that were created by Brendan 'PlayerUnknown' Greene for other games using the film Battle Royale for inspiration, and expanded into a standalone game under Greene's creative direction. In the game, up to one hundred players parachute onto an island and scavenge for weapons and equipment to kill others while avoiding getting killed themselves. The available safe area of the game's map decreases in size over time, directing surviving players into tighter areas to force encounters. The last player or team standing wins the round.",
      rating: 5,
      imgurl: '../resources/images/pubg.jpg',
      catalogcategoryurl: 'Battle%20royale',
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd38b27c2596093cb00718'),
      catalogcategoryurl: 'Battle%20royale',
      imgurl: '../resources/images/h1z1.jpg',
      rating: 5,
      catalogcategory: 'Battle royale',
      itemname: 'H1Z1',
      itemsname: 'H1Z1',
      itemcode: 'item6',
      UserId: 3,
      itemby: 'Daybreak Game Company',
      description:
        "H1Z1 is a free-to-play battle royale game developed and published by Daybreak Game Company. The game's development began after the original H1Z1 was spun off into two separate projects in early 2016: H1Z1: Just Survive and H1Z1: King of the Kill.",
      detaildescription:
        'The games were further split as separate projects in October 2017, with Just Survive dropping the H1Z1 name, and King of the Kill becoming simply H1Z1.After three years of being in early access for Microsoft Windows, it officially released as a free-to-play game in February 2018. H1Z1 was released for the PlayStation 4 in August 2018, and will be released for the Xbox One at a later date.',
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd38b47c2596093cb00719'),
      imgurl: '../resources/images/witcher3.jpg',
      catalogcategoryurl: 'RPG%20games',
      rating: 4,
      catalogcategory: 'RPG games',
      itemname: 'Witcher 3:Wild Hunt',
      itemsname: 'W3',
      itemcode: 'item7',
      UserId: 1,
      itemby: 'CD Projekt RED',
      description:
        'The Witcher 3: Wild Hunt is a 2015 action role-playing video game developed and published by CD Projekt. Based on The Witcher series of fantasy novels by Polish author Andrzej Sapkowski, it is the sequel to the 2011 game The Witcher 2: Assassins of Kings.',
      detaildescription:
        "Played in an open world with a third-person perspective, players control protagonist Geralt of Rivia, a monster hunter known as a Witcher, who is looking for his missing adopted daughter on the run from the Wild Hunt: an otherworldly force determined to capture and use her powers. Players battle the game's many dangers with weapons and magic, interact with non-player characters, and complete main-story and side quests to acquire experience points and gold, which are used to increase Geralt's abilities and purchase equipment. Its central story has several endings, determined by the player's choices at certain points in the game.",
      itemstatus: 'pending',
    },
    {
      _id: new ObjectId('5bdd38b77c2596093cb0071a'),
      imgurl: '../resources/images/ffaxv.jpg',
      catalogcategoryurl: 'RPG%20games',
      rating: 5,
      catalogcategory: 'RPG games',
      itemname: 'Final Fantasy XV',
      itemsname: 'FFAXV',
      itemcode: 'item8',
      UserId: 4,
      itemby: 'Yoko Shimomura',
      description:
        'Final Fantasy XV is an action role-playing video game developed and published by Square Enix as part of the long-running Final Fantasy series.It was released for the PlayStation 4 and Xbox One in 2016, and for Microsoft Windows in 2018.',
      detaildescription:
        'The game features an open world environment and action-based battle system, incorporating quick-switching weapons, elemental magic, and other features such as vehicle travel and camping. The base campaign was later expanded with downloadable content (DLC), adding further gameplay options such as additional playable characters and multiplayer.',
      itemstatus: 'available',
    },
    {
      _id: new ObjectId('5bdd38b97c2596093cb0071b'),
      imgurl: '../resources/images/fallout4.jpg',
      catalogcategoryurl: 'RPG%20games',
      rating: 5,
      itemcode: 'item9',
      itemname: 'Fallout 4',
      itemsname: 'Fallout 4',
      catalogcategory: 'RPG games',
      UserId: 4,
      itemby: 'Bethesda Game Studios',
      description:
        'Fallout 4 is a post-apocalyptic action role-playing video game developed by Bethesda Game Studios and published by Bethesda Softworks. It is the fifth major installment in the Fallout series.',
      detaildescription:
        "The game is set within an open world post-apocalyptic environment that encompasses the city of Boston and the surrounding Massachusetts region known as 'The Commonwealth'. The main story takes place in the year 2287, ten years after the events of Fallout 3 and 210 years after 'The Great War', which caused catastrophic nuclear devastation across the United States.",
      itemstatus: 'available',
    },
  ];
  /* Users data total count = 4*/
  var allusers = [
    {
      _id: new ObjectId('5bda64d176e1151b0cc24deb'),
      UserId: 1,
      Username: 'user1',
      hash:
        '1f6ef3b4e8c586a294cf47003ea3f3487e19b57a3e3ebd12a316f958acb09bb4db8131098663b9031d673e4e7431bf18be012684e5e0797f0570523834a07845',
      salt: '4cb9a4ae959ed0d3',
      firstName: 'James',
      lastName: 'Heyden',
      EmailAddress: 'user1@anyemail.com',
      Address1: 'user1add1',
      Address2: 'user1add2',
      City: 'charlotte',
      State: 'NC',
      PostCode: 28000,
      Country: 'USA',
    },
    {
      _id: new ObjectId('5bdd3afd7c2596093cb0071c'),
      UserId: 2,
      Username: 'user2',
      hash:
        '728a980350deba0aad9a12ce2784e0ffe3b00401992fabe3097ebaf159226addbdaa50f6af69419d394cafc80da64fa915b5e8895cb98f5a78b80c92a8b0370d',
      salt: '9f3a6996cb847f65',
      firstName: 'Randal',
      lastName: 'Pinnix',
      EmailAddress: 'user2@anyemail.com',
      Address1: 'user2add1',
      Address2: 'user2add2',
      City: 'charlotte',
      State: 'NC',
      PostCode: 28000,
      Country: 'USA',
    },
    {
      _id: new ObjectId('5bdd3aff7c2596093cb0071d'),
      UserId: 3,
      Username: 'user3',
      hash:
        'a2e323f7bac16f7d39e88d4ad46376772b09e7c067d6727ea63d257600333fba7911f115c92db6da9bd98b4cc45410eb55f6a31a25ea55972b56cab6664c2f33',
      salt: '0d194cdf5c43c1ec',
      firstName: 'Werner',
      lastName: 'Mcmullan',
      EmailAddress: 'user3@anyemail.com',
      Address1: 'user3add1',
      Address2: 'user3add2',
      City: 'charlotte',
      State: 'NC',
      PostCode: 28000,
      Country: 'USA',
    },
    {
      _id: new ObjectId('5bdd3b017c2596093cb0071e'),
      UserId: 4,
      Username: 'user4',
      hash:
        '34d973a2259f6854d5fdf7ff41e2c2858ac17bfb0fae44dcdc62f478cedb914f4f6e12c11e205228dcf613c796692c916cdb1725d40c692d4cae50adb8eb0ebc',
      salt: '6767f8e7accb17d8',
      firstName: 'Jordon',
      lastName: 'Lamoreaux',
      EmailAddress: 'user4@anyemail.com',
      Address1: 'user4add1',
      Address2: 'user4add2',
      City: 'charlotte',
      State: 'NC',
      PostCode: 28000,
      Country: 'USA',
    },
  ];
  /*offers data total count=3 */
  var alloffers = [
    {
      _id: new ObjectId('5be8c5af55461f7a48ca791b'),
      status: 'pending',
      offerId: 'offer1',
      offererId: 1,
      offereritemId: 'item2',
      offereeId: 2,
      offereeitemId: 'item1',
    },
    {
      _id: new ObjectId('5be8c5b91a73176c4c63f827'),
      status: 'pending',
      offerId: 'offer2',
      offererId: 1,
      offereritemId: 'item3',
      offereeId: 3,
      offereeitemId: 'item5',
    },
    {
      _id: new ObjectId('5be8d4421e47e45684af1d0c'),
      status: 'pending',
      offerId: 'offer3',
      offererId: 3,
      offereritemId: 'item6',
      offereeId: 1,
      offereeitemId: 'item7',
    },
  ];
  /* counter data for userID and offerID */
  var counter = [
    { _id: 'UserCounter', seq: 4 },
    { _id: 'offerCounter', seq: 3 },
  ];
  /* item feedback count=9 */
  var itemfeedback = [
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283ef6'),
      itemcode: 'item1',
      UserId: 2,
      rating: 4,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283ef7'),
      itemcode: 'item2',
      UserId: 1,
      rating: 4,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283ef8'),
      itemcode: 'item3',
      UserId: 1,
      rating: 3,
    },

    {
      _id: new ObjectId('5c0e066a88f2fe1be4283ef9'),
      itemcode: 'item4',
      UserId: 2,
      rating: 5,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283efa'),
      itemcode: 'item5',
      UserId: 3,
      rating: 5,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283efb'),
      itemcode: 'item6',
      UserId: 3,
      rating: 5,
    },

    {
      _id: new ObjectId('5c0e066a88f2fe1be4283efc'),
      itemcode: 'item7',
      UserId: 1,
      rating: 4,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283efd'),
      itemcode: 'item8',
      UserId: 4,
      rating: 5,
    },
    {
      _id: new ObjectId('5c0e066a88f2fe1be4283efe'),
      itemcode: 'item9',
      UserId: 4,
      rating: 5,
    },
  ];
  /*data insertion */
  dbo.collection('items').insertMany(allitems, function (err, res) {
    if (err) throw err;
    console.log('items inserted:' + res.insertedCount);
  });
  dbo.collection('users').insertMany(allusers, function (err, res) {
    if (err) throw err;
    console.log('users inserted:' + res.insertedCount);
  });
  dbo.collection('offers').insertMany(alloffers, function (err, res) {
    if (err) throw err;
    console.log('offers inserted:' + res.insertedCount);
  });
  dbo.collection('counter').insertMany(counter, function (err, res) {
    if (err) throw err;
    console.log('counter inserted:' + res.insertedCount);
  });
  dbo
    .collection('user-itemfeedback')
    .insertMany(itemfeedback, function (err, res) {
      if (err) throw err;
      console.log('itemfeedback inserted:' + res.insertedCount);
      console.log('All data required to start application is inserted');
    });
});
