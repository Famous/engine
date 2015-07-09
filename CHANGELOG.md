# Famous Rendering Engine Changelog

## 0.7.0

### Breaking Changes

- Make names of update methods of systems consistent d530a5ca612c1db30cfaa9df7800dffe35e2b674

### Bug Fixes

- No longer rely on id returned by Node#addComponent f345c5c0faa1dfef5e7d0023f7431ee4f47c2046
- Set DOMElement#_node before _requestUpdate e1eaec2128153aa1ca0fbf658250917de55fe3c7
- rename time material uniform ae4bf986b59119492ddd34e5229399f9d7d2cb73
- move traverse to material 73256911df5ee9bb7a8818ba468229e4d0b7baf0
- #151, materials now update meshes on uniform setting. [#95480122] 4648641e47f068b04fd7f2b48b949823a330e7f2
- Show nodes by default a158d08b31c00cf431a831eb91766d7980e129f9
- fix render size bug that was caused by the frist frame being display none to get rid of the bad frame dd29c7009f29d345b43dbe1c5bb6f5c90d28f0e3
- 361 ed1cd18cee4259295934d6819c84f940cf5cb413
- Remove duplicate Debug d3e970ad5eca2ba833ea2b8dc5c5cdadbbb90b81
- Fix onReceive bug when removing child while receiving event fdb3b1b7cbfee9506dbbba08ad3240862997d73d
- No longer throw error in Node#removeChild e21c094f4080eb3d9071216bcb741bd0b6bdd01c
- undefined i 4fe6dfc38bece5727ecfe6c29080dc118fa24b2f
- typo 7f06479d83c57042f5bfecc6b55d9251fc57fba2
- update breaking reference to the node's sizeMode c4580714da1d5a142a428dfc215dc1094d26a4bf
- Make Node#getChildren() return array without holes [#96509964] 9525278b0a7cc804a7f26de31c888a9e1e705a31
- Remove redundant DOMRenderer#unsubscribe function 5c85025ac8ef00ca9a1317f439bcdac73f2b22c3
- Fix UNSUBSCRIBE in DOMElement aa994fa6ba85a92adf7fed89312f1b8e0d4b7afe
- no default components on scene 352933f60ba27e03ffd5284b204c98ee905b48ab
- dom-element checks for sizeMode onMount 6b2a575678a2c3dcf2ac45500c594c91b7730fb6
- opt-out of default components rather than opt-in 3b63e3bb2f378ac2fa728b041d0077a91ed2c013
- multiple updates in node 3129bb427e465d1e44e68e6373ce688336ac8090
- can calculate world matrix without setting breakpoint f6b1dde0ce34d0e952b6c36d77ee30d6387bcbc9
- no default components on Scene 6e732fcecb8c6d2344019a6f2d15802883918d62
- dom element checks for sizemode on mount 5c7bdc6dcbb68c9a42eb3c831f479b211d881172
- opt-out of default components 8dc6a4e8c130679c28c55e5c282000d166839c97
- multiple updates in Node e4476319688ccd7b2ec99e0b35b7b2d4c0885fab
- add contextmenu to eventmap #290 076d913a43a3642c11bca118a10a87a10de482b0

### Features

- Add ElementCache lifecycle events 7f62062057db688d604aa9ecd5ca21581170e516
- added more commands to pretty printer 66168c82bfc94209c4d89005c91b186917920a60
- added more commands to the pretty printer 462ea1276773ca5340478be32b6bc07b293e72dc
- started adding commands to the command printer 1f2757ab05162c4997f9359a729219f57dbf1195

### Testing and Tooling

- Remove t.comment f3779b182cbf0b00bcd8c6c5819da8ffef4b8083
- Run FamousEngine tests 471886ae08590c63bc1b8e46e5459ef3ca9f636c
- Run Event tests 08d7dd21e3a0b0860e15850cd3449a5b0481a844
- Test Channel 5fd46760ff35636f2acadb503d7b9979af2e32bb
- Test Clock ba20fd65ae097d63f2894d5f52f98f5ac0ba508f
- Add test-case for man in the middle insertion cf631efa299f073571d01a85c8d75e874450ddc0
- Fix Node.api f732d50238a1fdcdbf6c12cb689d05ae89df4a47
- Test Node, Node#getChildren, Node#getRawChildren 007a93255ec70a669c44f76412400b3e0797ca9d


## 0.6.2

### Bug Fixes

- mount and show logic 8a916b91986cad8f704fbf4ecd5efced2474c093

### Testing and Tooling

- fix test for default geometry 6a33d097b7876fa47fe09a8560224b1a7906a105


## 0.6.1

### Bug Fixes

- removing unique faces in sphere 657db0168b71674c48fe8296845a5a03e78eaf0c
- sphere texture issues near poles 7583532a80ab8efde5acf93cf7fe613029530062
- accounting for float32 array in cutoutuniform setting 04b0ea3e2925f841b735cdc6d32f3db640efd46b
- Correct typos for inline documentation of Curves.js 3a867292384bb7abcfdf7c90fdb0eea9409ceeef
- removing duplicate switch case 427adeaae9c5bc0983df348ce6b1049e05939056
- removing breaking bug where canvas size is attempted to be set when no size is passed into updateSize 089fa3937e124f6c54cd203bf839baa667b91c7d
- remove-subtree b518234caf9dc91672ecb6a12e5cd48e8c3d37c2
- Add ID reference to component after onMount call e05c2f2edc698d58bb4848d53cd90e4548739b1d
- rotation bug with passing null c91faae954f1e8210702bc540100cab9c5d8dfaf
- Dismount logic 0df10bf05b4416d634b6860ff7c114e7eece6b04
- Export all core modules af25946e31046b475199f27180329c7882e6b049
- missed two calls 9e86bcd4faccb66519c2d5761204e52fa4839354
- made method names consistent in size 0243991250922f2edc1125999e995877c7c1e32e


## 0.6.0

### Breaking Changes

- Remove NEED_SIZE_FOR command 30aa14d1dc40f6411417d807d2dc72f5b5db0ecc
- Rename (start|stop)Engine -> (start|stop)RenderLoop be71aae5894a17956d0dd5df0fa04f2bd829e397

### Bug Fixes

- fix the draw phase of DOMElement to allow for styles and attributes with 0 values 6542b0094febe95725f9c249a25df253a80ac3ba
- many bugs fixed a3d1bcf3b9a8d4cc81ebc5aa7091e573c33ed11d
- bug in sizesystem f5bacdcdce14f186f8c3f259498970535c16815e
- don't print function sort e15f4edfbab10e4ba012c35ae42552abff0f98f8
- better equality testing 65c56ce0c5665a7e47efd63b630cb24c531a2615
- Node can have values set before it was mounted 1a97abd2ba3c61b3f7812f4689d49eeeddc201c3
- made SizeSystem and TransformSystem be able to take components d02855bb079eface301dc742808c1bdeb1a6a32b
- fixed failing tests for Path ce02fb60d4171e53c2648217fbf4a29b16ddee70
- problems regarding mount and node updates fe1149b1722ae73e049e68e7a27ebef71653cf95
- Fix Node#dismount 68028b96cb8d7f4330ccfb26046b6d4f906d7066
- Fix PathStore#remove 6a116122a80bf23fb91fce8372620e185eb5d501
- renamed Layer to PathStore c5ce48c913ba86fcbbbdb2205f3401c1734bfa81
- delegated to systems for .get Methods fb06f9873a7e78e57b9b751d0ded2f8d262e3b4f
- Call change functions with vectors 1ac3cada2ec185be86b42a6146c8f4fa0d1903b5
- Fix gimbal lock case in quaternion -> euler conversion e49536c4322761a37acb37e02a80a26b55a0c0f7
- Correctly handle TIME command in Context 8fb0043a8bc2f45d8c3bae52a53afc7e8e398291
- rebase killed DOMRenderer b25744e43377787aab7b4812150370d8f26b353c
- Engine test to use ENUM 6f7697ea992af0a01e36357e24a0ad7b685a29d3
- tests with changes cc70ec20503009ea1acd448225dc12542e191fef
- Scene 0df62a1a849fd321fc74037dde302ccffc0aba3f
- removed default onMount and onDismount 63def6dd370bb4687e8821da8d93aadaf46b0720
- transform changes after rebase c637d472f026a9a3cae4f0c500b928d1008f688d
- applyLight a52768cb95db9dda13fcdcf40c844670fd33b851
- adding semi-colon, changing line spacing 3eae1b9c117189496ef3b27c2e90b168eabc153e
- removing dependency on geometry in WebGLRenderer db369e945bc7f57facdb07c296c79c614282ad73
- removing removeEventListener from unsubscribe fe2d1e6653358f444150d6307a1d1746c25780ef
- removing redundant requestUpdate calls 12510b9c1c9844d82c969e9dab05831ea3d33c13
- fixing listener check 8ade948e6fb086110fde893b62277644dcaacd47
- Fix initial glitch (Context solution) 90f57847c2f578dadac504607db1ecf8754e35b7
- fixing blending option and setDrawOptions for unmounted nodes bd2a19a3f5f5a52494653c28feb1b3f6c4e3af47
- Reset cutout on dismount 5b88db5c22676d76f88b09c27e58ec20c9b71620
- Correctly set content on textarea and input elements [#96172404] bdc3a653715c211922b6c45ae10ef11ce005f0bc
- Prevent nested void elements [#96086006] 2887032fb214db679a5e7b674e3b1b0fd8f3621e
- No longer stopPropagation on events 07b501d156ae3854c4f8816dbaeb140acf5e1d75
- Fix DOMElement#setCutoutState 130468a22361615a36062ef11f551467ab19a187
- initialize DOMElement with correct size mode bb401813c3aa7d64b4b0bf4f54daf5aaff96e36f

### Features

- added comments to size 8dd2c5cb3c2dfa368bdc58818a04b29310cddd7c
- added size system e3d10c6350847f03502598e7e08f20b9bdc570ef
- broke Layer out of systems b34f7abaca4775ca14478110154cca70b96fa9d0
- broke out world and local transforms into their own events 65cf18995e6a119219dfe63dcb79933896ae0489
- Provide access to renderers a4cde90f30ddedcb432908d3ee25f00507971e3d
- adding unsubscribe to DOMRenderer 0eea5fd7861194cd1d83ded93dbd0d8dc7967e7c
- adding unsubscribe command to context 09f03064e1b5b5a7e3ff375c1bb4cd52485a5a6e
- adding onRemoveUIEvent and unsubscribe a3f0528158904c4cedf2f0c07313f7c6ffc369e6
- adding removeUIEvent function 5716f6f196e7df1e0e9c789cab5387f61bfe1ac9
- add/remove instantiated scenes from the engine e17669344f18861a24b9a7fd9b9ebc39ae408a44
- PREVENT_DEFAULT command fe0e330fa65d9e550fd922530ed481e2bd2f6705

### Testing and Tooling

- Add test case for inserting elements 3a423db8105dd08ee01f1c23a8cd2faeef943abf


## 0.5.2

### Bug Fixes

- Fix DOMRenderer#insertEl when changing tags 7d0ee58b0e39a2f4f2ae4cd0f00d38bf594223d5
- Apply correct pointer events to Canvas 1f786abf1aefa19f7bd1376e6a78bcc9536fc299


## 0.5.1

### Bug Fixes

- intra scene eventing 9d4c05e79fe60a242c00583fa544d91d42762a3d
- Remove duplicate _requestUpdate 3425daa6a341f9d8c9bc248a732fbac12c1a7a4f
- avoiding .getUniformLocation calls for unused uniforms [Fixes #95482090] 1774b6761c2d5c4152c0b26770612e9387d460c1

### Features

- Add support for Hi-Dpi screens f1c3b79d866a97c259315b5418448b488a490e58
- Add full-size styling to WebGL Canvas 53355db59809feb186d2716a2629645ca22f015d


