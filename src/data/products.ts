import { Product, Category, Video, Shop, Badge } from './types';

// ===== REAL UNSPLASH IMAGES BY CATEGORY =====
const images = {
  phones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1580910051074-3eb694886f8b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&h=800&fit=crop',
  ],
  laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&h=800&fit=crop',
  ],
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&h=800&fit=crop',
  ],
  watches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1434056886845-dbd39c1cc727?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1557531365-e8b22d93dbd0?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&h=800&fit=crop',
  ],
  tablets: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1632882765546-1ee75f53becb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop',
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1606986628126-77296f5ad069?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&h=800&fit=crop',
  ],
  menClothing: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
  ],
  womenClothing: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1475180429745-767b5d025ac2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800&h=800&fit=crop',
  ],
  dresses: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1614251055880-ee96e4803393?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1559034750-cdab70a66b8e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=800&fit=crop',
  ],
  menShoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop',
  ],
  womenShoes: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560343090-f0409e644319?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=800&h=800&fit=crop',
  ],
  bags: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=800&h=800&fit=crop',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=800&fit=crop',
  ],
  homeDecor: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583778176476-4a8b02cbd77c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop',
  ],
  skincare: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&h=800&fit=crop',
  ],
  makeup: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1599733589046-10c877bbb5c6?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583241800698-e8ab01828b5d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560567547-01a5c2b9bb1d?w=800&h=800&fit=crop',
  ],
  perfume: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&h=800&fit=crop',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=800&h=800&fit=crop',
  ],
  sportswear: [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1521805103424-d8f8430e8933?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
  ],
  babyClothes: [
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1578897367107-2828e663a2c0?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800&h=800&fit=crop',
  ],
  toys: [
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1584661156681-540e80a161d3?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1613024509674-7c89e2296dd7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&h=800&fit=crop',
  ],
  snacks: [
    'https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1575224526797-5730d09d781d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=800&h=800&fit=crop',
  ],
  drinks: [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1571950006415-d99fb4b38b17?w=800&h=800&fit=crop',
  ],
  carAccessories: [
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=800&fit=crop',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
  ],
  sunglasses: [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560343787-b90cb337028e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop',
  ],
};

// ===== SHOPS =====
const shops: Shop[] = [
  { id: 'shop-apple', name: 'Apple Official Store', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop', rating: 4.9, salesCount: 158420, followersCount: 892000, productsCount: 156, isVerified: true, isOfficialStore: true, responseRate: 99, responseTime: '5 мин', location: 'Бишкек', createdAt: '2020-01-15' },
  { id: 'shop-samsung', name: 'Samsung Store', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop', rating: 4.8, salesCount: 125680, followersCount: 654000, productsCount: 243, isVerified: true, isOfficialStore: true, responseRate: 98, responseTime: '10 мин', location: 'Бишкек', createdAt: '2019-06-20' },
  { id: 'shop-xiaomi', name: 'Xiaomi Mi Store', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&h=100&fit=crop', rating: 4.7, salesCount: 234500, followersCount: 456000, productsCount: 512, isVerified: true, isOfficialStore: true, responseRate: 97, responseTime: '15 мин', location: 'Бишкек', createdAt: '2020-03-10' },
  { id: 'shop-nike', name: 'Nike Official', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', rating: 4.9, salesCount: 345000, followersCount: 1200000, productsCount: 890, isVerified: true, isOfficialStore: true, responseRate: 99, responseTime: '5 мин', location: 'Бишкек', createdAt: '2018-09-01' },
  { id: 'shop-adidas', name: 'Adidas Store', logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100&h=100&fit=crop', rating: 4.8, salesCount: 287000, followersCount: 980000, productsCount: 756, isVerified: true, isOfficialStore: true, responseRate: 98, responseTime: '10 мин', location: 'Бишкек', createdAt: '2019-02-15' },
  { id: 'shop-zara', name: 'ZARA Fashion', logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop', rating: 4.7, salesCount: 198000, followersCount: 567000, productsCount: 1230, isVerified: true, isOfficialStore: true, responseRate: 96, responseTime: '20 мин', location: 'Бишкек', createdAt: '2019-08-20' },
  { id: 'shop-hm', name: 'H&M Store', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&h=100&fit=crop', rating: 4.6, salesCount: 165000, followersCount: 432000, productsCount: 1456, isVerified: true, isOfficialStore: true, responseRate: 95, responseTime: '25 мин', location: 'Бишкек', createdAt: '2020-01-10' },
  { id: 'shop-loreal', name: "L'Oreal Beauty", logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop', rating: 4.8, salesCount: 143000, followersCount: 389000, productsCount: 678, isVerified: true, isOfficialStore: true, responseRate: 97, responseTime: '15 мин', location: 'Бишкек', createdAt: '2019-11-05' },
  { id: 'shop-ikea', name: 'IKEA Home', logo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop', rating: 4.7, salesCount: 98000, followersCount: 287000, productsCount: 2340, isVerified: true, isOfficialStore: true, responseRate: 94, responseTime: '30 мин', location: 'Бишкек', createdAt: '2020-05-15' },
  { id: 'shop-decathlon', name: 'Decathlon Sports', logo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop', rating: 4.6, salesCount: 87000, followersCount: 234000, productsCount: 1890, isVerified: true, isOfficialStore: true, responseRate: 93, responseTime: '35 мин', location: 'Бишкек', createdAt: '2020-07-20' },
  { id: 'shop-kids', name: 'Kids Paradise', logo: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=100&h=100&fit=crop', rating: 4.8, salesCount: 76000, followersCount: 198000, productsCount: 1234, isVerified: true, isOfficialStore: false, responseRate: 96, responseTime: '20 мин', location: 'Бишкек', createdAt: '2020-09-10' },
  { id: 'shop-tech', name: 'TechWorld KG', logo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop', rating: 4.5, salesCount: 54000, followersCount: 143000, productsCount: 567, isVerified: true, isOfficialStore: false, responseRate: 92, responseTime: '40 мин', location: 'Ош', createdAt: '2021-01-15' },
  { id: 'shop-fashion', name: 'Fashion House', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', rating: 4.4, salesCount: 43000, followersCount: 98000, productsCount: 876, isVerified: true, isOfficialStore: false, responseRate: 91, responseTime: '45 мин', location: 'Бишкек', createdAt: '2021-03-20' },
  { id: 'shop-food', name: 'Tasty Market', logo: 'https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=100&h=100&fit=crop', rating: 4.6, salesCount: 67000, followersCount: 156000, productsCount: 432, isVerified: true, isOfficialStore: false, responseRate: 94, responseTime: '25 мин', location: 'Бишкек', createdAt: '2020-11-05' },
  { id: 'shop-auto', name: 'AutoParts KG', logo: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=100&h=100&fit=crop', rating: 4.5, salesCount: 34000, followersCount: 87000, productsCount: 1567, isVerified: true, isOfficialStore: false, responseRate: 90, responseTime: '50 мин', location: 'Бишкек', createdAt: '2021-02-10' },
];

// ===== PRODUCT DATA =====
interface ProductData {
  titles: string[];
  imageKey: keyof typeof images;
  priceRange: [number, number];
  brands: string[];
  categoryId: string;
  colors?: string[];
  sizes?: string[];
  shopIds: string[];
}

const productData: ProductData[] = [
  // ELECTRONICS
  { titles: ['iPhone 15 Pro Max 256GB', 'iPhone 15 Pro 128GB', 'iPhone 14 Plus', 'iPhone 14 128GB', 'iPhone 13 mini', 'iPhone SE 2022', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S23 FE', 'Samsung Galaxy A54', 'Samsung Galaxy A34', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi Redmi Note 13 Pro+', 'Xiaomi Redmi Note 13', 'Xiaomi Poco X6 Pro', 'Xiaomi Poco F5', 'OnePlus 12', 'Google Pixel 8 Pro', 'OPPO Find X7 Ultra', 'Vivo X100 Pro', 'Honor Magic 6 Pro', 'Huawei Mate 60 Pro', 'Nothing Phone 2'], imageKey: 'phones', priceRange: [15000, 180000], brands: ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google', 'OPPO', 'Vivo', 'Honor', 'Huawei', 'Nothing'], colors: ['Кара', 'Ак', 'Көк', 'Күмүш', 'Алтын'], sizes: ['128GB', '256GB', '512GB', '1TB'], shopIds: ['shop-apple', 'shop-samsung', 'shop-xiaomi', 'shop-tech'], categoryId: '2' },
  { titles: ['MacBook Pro 16" M3 Max', 'MacBook Pro 14" M3 Pro', 'MacBook Air 15" M3', 'MacBook Air 13" M3', 'Dell XPS 15', 'Dell XPS 13 Plus', 'HP Spectre x360', 'HP Envy 16', 'Lenovo ThinkPad X1 Carbon', 'Lenovo Yoga 9i', 'ASUS ZenBook Pro 16', 'ASUS ROG Zephyrus G16', 'Acer Swift 5', 'MSI Creator Z16', 'Samsung Galaxy Book4 Ultra', 'Huawei MateBook X Pro'], imageKey: 'laptops', priceRange: [45000, 350000], brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Huawei'], colors: ['Күмүш', 'Көк кара', 'Кара'], sizes: ['8GB/256GB', '16GB/512GB', '32GB/1TB'], shopIds: ['shop-apple', 'shop-tech'], categoryId: '2' },
  { titles: ['AirPods Pro 2', 'AirPods Max', 'AirPods 3', 'Sony WH-1000XM5', 'Sony WF-1000XM5', 'Samsung Galaxy Buds2 Pro', 'Bose QuietComfort Ultra', 'JBL Tour One M2', 'JBL Tune 770NC', 'Beats Studio Pro', 'Beats Fit Pro', 'Sennheiser Momentum 4', 'Xiaomi Buds 4 Pro', 'Marshall Major IV', 'Audio-Technica ATH-M50x'], imageKey: 'headphones', priceRange: [3000, 65000], brands: ['Apple', 'Sony', 'Samsung', 'Bose', 'JBL', 'Beats', 'Sennheiser', 'Xiaomi', 'Marshall'], colors: ['Кара', 'Ак', 'Көк', 'Күмүш'], shopIds: ['shop-apple', 'shop-samsung', 'shop-xiaomi', 'shop-tech'], categoryId: '2' },
  { titles: ['Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch SE 2', 'Samsung Galaxy Watch 6 Classic', 'Samsung Galaxy Watch 6', 'Garmin Fenix 8', 'Garmin Venu 3', 'Xiaomi Watch 2 Pro', 'Huawei Watch GT 4', 'Amazfit GTR 4', 'Fitbit Sense 2', 'Google Pixel Watch 2'], imageKey: 'watches', priceRange: [5000, 95000], brands: ['Apple', 'Samsung', 'Garmin', 'Xiaomi', 'Huawei', 'Amazfit', 'Fitbit', 'Google'], colors: ['Кара', 'Ак', 'Күмүш', 'Алтын'], sizes: ['40mm', '44mm', '45mm', '49mm'], shopIds: ['shop-apple', 'shop-samsung', 'shop-xiaomi', 'shop-tech'], categoryId: '2' },
  { titles: ['iPad Pro 12.9" M2', 'iPad Pro 11" M2', 'iPad Air 5', 'iPad 10', 'iPad mini 6', 'Samsung Galaxy Tab S9 Ultra', 'Samsung Galaxy Tab S9+', 'Xiaomi Pad 6 Pro', 'Huawei MatePad Pro', 'Lenovo Tab P12 Pro', 'OnePlus Pad'], imageKey: 'tablets', priceRange: [12000, 180000], brands: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Lenovo', 'OnePlus'], colors: ['Күмүш', 'Көк кара', 'Кара'], sizes: ['64GB', '128GB', '256GB', '512GB'], shopIds: ['shop-apple', 'shop-samsung', 'shop-xiaomi', 'shop-tech'], categoryId: '2' },
  { titles: ['Sony A7 IV', 'Sony A7C II', 'Sony ZV-E10', 'Canon EOS R6 Mark II', 'Canon EOS R8', 'Nikon Z8', 'Nikon Z6 III', 'Fujifilm X-T5', 'GoPro Hero 12', 'DJI Osmo Pocket 3', 'Insta360 X4'], imageKey: 'cameras', priceRange: [25000, 450000], brands: ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'GoPro', 'DJI', 'Insta360'], colors: ['Кара', 'Күмүш'], shopIds: ['shop-tech'], categoryId: '2' },

  // FASHION - MEN
  { titles: ['Эркектер футболкасы Premium', 'Эркектер поло көйнөгү', 'Классикалык эркек көйнөк', 'Slim Fit джинсы', 'Эркектер худи', 'Спорттук костюм', 'Эркектер куртка кышкы', 'Жылуу свитер', 'Эркектер костюм классика', 'Casual пиджак', 'Эркектер шорты', 'Кардиган', 'Жилет', 'Эркектер пальто', 'Ветровка', 'Bomber куртка', 'Джоггеры', 'Чино брюки', 'Термобелье'], imageKey: 'menClothing', priceRange: [800, 15000], brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Calvin Klein', 'Tommy Hilfiger', 'Polo Ralph Lauren', 'Lacoste', 'Hugo Boss'], colors: ['Кара', 'Ак', 'Көк', 'Боз', 'Кызыл', 'Жашыл'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], shopIds: ['shop-nike', 'shop-adidas', 'shop-zara', 'shop-hm', 'shop-fashion'], categoryId: '3' },

  // FASHION - WOMEN
  { titles: ['Аялдар блузкасы', 'Элегант көйнөк', 'Аялдар джинсы Slim', 'Кашемир свитер', 'Аялдар куртка', 'Юбка миди', 'Аялдар пальто', 'Топ кроп', 'Кардиган жумшак', 'Брюки классика', 'Аялдар худи оверсайз', 'Леггинсы', 'Комбинезон', 'Жемпер', 'Тренч пальто', 'Жилет', 'Аялдар шорты', 'Юбка мини', 'Туника', 'Боди'], imageKey: 'womenClothing', priceRange: [900, 18000], brands: ['Zara', 'H&M', 'Mango', 'Massimo Dutti', 'Calvin Klein', 'Tommy Hilfiger', 'Michael Kors', 'Guess', 'Forever 21', 'Bershka'], colors: ['Кара', 'Ак', 'Кызыл', 'Көк', 'Кызгылт', 'Бежевый'], sizes: ['XS', 'S', 'M', 'L', 'XL'], shopIds: ['shop-zara', 'shop-hm', 'shop-fashion'], categoryId: '3' },

  // DRESSES
  { titles: ['Кечки көйнөк макси', 'Коктейль көйнөк', 'Жайкы көйнөк гүлдүү', 'Офистик көйнөк', 'Той көйнөгү ак', 'Көйнөк миди', 'Боди-кон көйнөк', 'Көйнөк А-силуэт', 'Атлас көйнөк', 'Бархат көйнөк', 'Кружево көйнөк', 'Wrap көйнөк', 'Көйнөк плиссе'], imageKey: 'dresses', priceRange: [2500, 35000], brands: ['Zara', 'H&M', 'Mango', 'ASOS', 'Reformation', 'Self-Portrait', 'Ted Baker'], colors: ['Кара', 'Ак', 'Кызыл', 'Көк', 'Жашыл', 'Кызгылт', 'Алтын'], sizes: ['XS', 'S', 'M', 'L', 'XL'], shopIds: ['shop-zara', 'shop-hm', 'shop-fashion'], categoryId: '3' },

  // SHOES - MEN
  { titles: ['Nike Air Max 90', 'Nike Air Force 1', 'Nike Dunk Low', 'Nike Air Jordan 1', 'Nike Blazer Mid', 'Adidas Ultraboost 23', 'Adidas Stan Smith', 'Adidas Samba OG', 'Adidas Forum Low', 'Adidas Gazelle', 'New Balance 574', 'New Balance 990v6', 'New Balance 550', 'Puma Suede Classic', 'Converse Chuck Taylor', 'Vans Old Skool', 'Reebok Classic', 'Asics Gel-1130', 'Dr. Martens 1460', 'Timberland 6-Inch Boot'], imageKey: 'menShoes', priceRange: [3500, 28000], brands: ['Nike', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans', 'Reebok', 'Asics', 'Dr. Martens', 'Timberland'], colors: ['Кара', 'Ак', 'Боз', 'Көк', 'Кызыл'], sizes: ['40', '41', '42', '43', '44', '45', '46'], shopIds: ['shop-nike', 'shop-adidas'], categoryId: '4' },

  // SHOES - WOMEN
  { titles: ['Nike Air Max 97', 'Nike React', 'Adidas Superstar', 'Adidas NMD R1', 'Аялдар бут кийим', 'Жогорку такалуу туфли', 'Балетки', 'Лоферлер', 'Сандалдар', 'Эспадрильи', 'Мокасиндер', 'Слипоны', 'Ботильондор', 'Сапоги узун', 'Угги', 'Челси ботинки', 'Кроссовки платформа', 'Туфли Mary Jane', 'Мюли'], imageKey: 'womenShoes', priceRange: [2800, 25000], brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Steve Madden', 'ALDO', 'Sam Edelman', 'Stuart Weitzman'], colors: ['Кара', 'Ак', 'Бежевый', 'Кызыл', 'Кызгылт'], sizes: ['35', '36', '37', '38', '39', '40', '41'], shopIds: ['shop-nike', 'shop-adidas', 'shop-zara', 'shop-hm'], categoryId: '4' },

  // BAGS
  { titles: ['Арткы сумка кожа', 'Тоут сумка чоң', 'Кросс-боди сумка', 'Клатч кечки', 'Спорт сумка', 'Саякат сумкасы', 'Портфель иш', 'Шопер сумка', 'Поясная сумка', 'Рюкзак ноутбук', 'Дафл сумка', 'Месенджер сумка', 'Сумка хобо', 'Сумка багет', 'Мини сумка'], imageKey: 'bags', priceRange: [1500, 45000], brands: ['Zara', 'H&M', 'Michael Kors', 'Coach', 'Kate Spade', 'Fossil', 'Guess', 'Calvin Klein', 'Tory Burch'], colors: ['Кара', 'Күрөң', 'Бежевый', 'Ак', 'Кызыл'], shopIds: ['shop-zara', 'shop-hm', 'shop-fashion'], categoryId: '3' },

  // HOME - FURNITURE
  { titles: ['Диван 3-орундук', 'Диван бурчтук', 'Кресло жумшак', 'Кровать 160x200', 'Кровать 180x200', 'Тумбочка түнкү', 'Шкаф кийим', 'Комод', 'Стол жазуу', 'Стол ашкана', 'Отургуч офис', 'Полка китеп', 'ТВ тумба', 'Кофе стол', 'Зеркало чоң', 'Пуф жумшак', 'Стеллаж'], imageKey: 'furniture', priceRange: [5000, 85000], brands: ['IKEA', 'Ashley', 'La-Z-Boy', 'Pottery Barn', 'West Elm', 'Crate & Barrel', 'Wayfair'], colors: ['Ак', 'Боз', 'Күрөң', 'Кара', 'Бежевый'], shopIds: ['shop-ikea'], categoryId: '5' },

  // HOME - DECOR
  { titles: ['Жаздык декоративдүү', 'Плед жумшак', 'Көрпө жуурканча', 'Лампа стол', 'Лампа торшер', 'Вазон гүл', 'Картина холст', 'Саат дубал', 'Жаздык мойнуга', 'Килем декор', 'Свеча ароматтуу', 'Рамка сүрөт', 'Органайзер', 'Корзина сактоо', 'Штора', 'Ваза гүлдөр'], imageKey: 'homeDecor', priceRange: [500, 15000], brands: ['IKEA', 'H&M Home', 'Zara Home', 'West Elm', 'Pottery Barn', 'Target'], colors: ['Ак', 'Боз', 'Бежевый', 'Көк', 'Жашыл'], shopIds: ['shop-ikea'], categoryId: '5' },

  // HOME - KITCHEN
  { titles: ['Табак сервиз 24 шт', 'Чыны сервиз 12 шт', 'Кастрюля топтом', 'Сковорода антипригар', 'Нож топтом', 'Блендер', 'Миксер', 'Тостер', 'Кофеварка', 'Чайник электр', 'Мультиварка', 'Микроволновка', 'Аэрогриль', 'Соковыжималка', 'Контейнер сактоо', 'Термос', 'Ланч-бокс'], imageKey: 'kitchen', priceRange: [800, 35000], brands: ['IKEA', 'Tefal', 'Philips', 'Bosch', 'KitchenAid', 'Braun', 'Moulinex', "De'Longhi"], colors: ['Ак', 'Кара', 'Күмүш', 'Кызыл'], shopIds: ['shop-ikea'], categoryId: '5' },

  // BEAUTY - SKINCARE
  { titles: ['Бет кремы күндүзгү', 'Бет кремы түнкү', 'Сыворотка витамин C', 'Сыворотка гиалурон', 'Тоник бет', 'Гель жуугуч', 'Пенка жуугуч', 'Маска бет', 'Патчи көз', 'Скраб бет', 'Пилинг', 'Масло бет', 'Крем көз', 'СПФ крем', 'Мицеллярдуу суу', 'Эссенция', 'Крем колдор'], imageKey: 'skincare', priceRange: [400, 12000], brands: ["L'Oreal", 'Nivea', 'Neutrogena', 'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Vichy', 'Clinique', 'Estee Lauder', 'SK-II'], shopIds: ['shop-loreal'], categoryId: '6' },

  // BEAUTY - MAKEUP
  { titles: ['Тоналдык крем', 'Консилер', 'Пудра компакт', 'Румяна', 'Хайлайтер', 'Бронзер', 'Тени палитра', 'Тушь кирпик', 'Карандаш көз', 'Подводка', 'Помада', 'Блеск эрин', 'Карандаш эрин', 'Карандаш каш', 'Гель каш', 'Праймер', 'Фиксатор макияж', 'Кисть топтом', 'Спонж макияж'], imageKey: 'makeup', priceRange: [350, 8500], brands: ["L'Oreal", 'Maybelline', 'MAC', 'NYX', 'Urban Decay', 'Too Faced', 'Charlotte Tilbury', 'NARS', 'Fenty Beauty', 'Rare Beauty'], shopIds: ['shop-loreal'], categoryId: '6' },

  // BEAUTY - PERFUME
  { titles: ['Духи аял 50мл', 'Духи аял 100мл', 'Духи эркек 50мл', 'Духи эркек 100мл', 'Туалет суусу', 'Парфюм суусу', 'Дезодорант спрей', 'Арома диффузер', 'Арома свеча', 'Духи мини', 'Духи унисекс', 'Лосьон дене'], imageKey: 'perfume', priceRange: [1500, 45000], brands: ['Chanel', 'Dior', 'Gucci', 'Versace', 'Dolce & Gabbana', 'Armani', 'Yves Saint Laurent', 'Tom Ford', 'Jo Malone', 'Creed'], shopIds: ['shop-loreal'], categoryId: '6' },

  // SPORTS - FITNESS
  { titles: ['Гантели топтом', 'Штанга топтом', 'Беговая дорожка', 'Велотренажер', 'Эллиптик тренажер', 'Гиря 16кг', 'Коврик йога', 'Фитнес резинка', 'Турник дверь', 'Скакалка', 'Мяч фитнес', 'Ролик пресс', 'Степ платформа', 'Эспандер', 'Петли TRX', 'Боксерская груша', 'Перчатки бокс', 'Скамья жим'], imageKey: 'fitness', priceRange: [500, 95000], brands: ['Decathlon', 'Nike', 'Adidas', 'Reebok', 'Under Armour', 'Puma', 'Bowflex', 'NordicTrack'], shopIds: ['shop-nike', 'shop-adidas', 'shop-decathlon'], categoryId: '7' },

  // SPORTS - SPORTSWEAR
  { titles: ['Футболка спорт', 'Шорты спорт', 'Леггинсы спорт', 'Топ спорт аял', 'Худи спорт', 'Ветровка спорт', 'Костюм спорт', 'Носки спорт', 'Повязка голова', 'Перчатки тренинг', 'Жилет спорт', 'Куртка спорт', 'Брюки спорт', 'Бра спорт', 'Компрессия кийим', 'Термобелье спорт', 'Кепка спорт', 'Рюкзак спорт', 'Сумка спорт'], imageKey: 'sportswear', priceRange: [800, 12000], brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'New Balance', 'Lululemon', 'Gymshark'], colors: ['Кара', 'Ак', 'Боз', 'Көк', 'Кызыл'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], shopIds: ['shop-nike', 'shop-adidas', 'shop-decathlon'], categoryId: '7' },

  // KIDS - CLOTHES
  { titles: ['Боди балага', 'Комбинезон балага', 'Костюм балага', 'Платье кыз балага', 'Шорты бала', 'Футболка бала', 'Джинсы бала', 'Куртка бала', 'Шапка бала', 'Носки бала топтом', 'Пижама бала', 'Жилет бала', 'Свитер бала', 'Брюки бала', 'Юбка кыз бала', 'Кофта бала', 'Комплект бала'], imageKey: 'babyClothes', priceRange: [400, 5000], brands: ['H&M Kids', 'Zara Kids', "Carter's", 'Gap Kids', 'OshKosh', 'Mothercare', 'Next Kids'], colors: ['Кызгылт', 'Көк', 'Ак', 'Боз', 'Сары'], sizes: ['0-3 ай', '3-6 ай', '6-12 ай', '1-2 жаш', '2-3 жаш', '3-4 жаш', '4-5 жаш'], shopIds: ['shop-kids', 'shop-hm', 'shop-zara'], categoryId: '8' },

  // KIDS - TOYS
  { titles: ['Конструктор LEGO', 'Кукла Barbie', 'Машина радио башкаруу', 'Мягкая игрушка', 'Пазл 1000 шт', 'Настольный оюн', 'Робот трансформер', 'Набор доктор', 'Набор ашпозчу', 'Железная дорога', 'Самолет оюнчук', 'Динозавр оюнчук', 'Кукольный дом', 'Мяч оюнчук', 'Набор инструменты', 'Музыкалык оюнчук', 'Развивающий куб', 'Велосипед бала'], imageKey: 'toys', priceRange: [300, 25000], brands: ['LEGO', 'Mattel', 'Hasbro', 'Fisher-Price', 'Hot Wheels', 'Playmobil', 'Nerf', 'VTech'], shopIds: ['shop-kids'], categoryId: '8' },

  // FOOD - SNACKS
  { titles: ['Шоколад молочный 100г', 'Шоколад горький 85%', 'Конфеты ассорти 500г', 'Печенье сливочное', 'Вафли шоколадные', 'Чипсы картофель', 'Орехи микс 300г', 'Сухофрукты микс', 'Мармелад', 'Зефир', 'Халва', 'Козинаки', 'Гранола батончик', 'Протеин батончик', 'Крекер', 'Попкорн'], imageKey: 'snacks', priceRange: [80, 2500], brands: ['Nestle', 'Ferrero', 'Milka', 'Lindt', "Lay's", 'Pringles', 'Oreo', 'KitKat', 'Snickers', 'Mars'], shopIds: ['shop-food'], categoryId: '9' },

  // FOOD - DRINKS
  { titles: ['Кофе зерно 1кг', 'Кофе молотый 250г', 'Чай зеленый 100г', 'Чай черный 100г', 'Какао порошок', 'Энергетик', 'Газировка 1.5л', 'Сок апельсин 1л', 'Сок яблоко 1л', 'Вода минерал 1.5л', 'Молоко 1л', 'Йогурт питьевой', 'Кефир 1л', 'Компот', 'Лимонад', 'Айран', 'Смузи'], imageKey: 'drinks', priceRange: [50, 3500], brands: ['Coca-Cola', 'Pepsi', 'Nescafe', 'Lipton', 'Red Bull', 'Monster', 'Fanta', 'Sprite', 'Jacobs', 'Lavazza'], shopIds: ['shop-food'], categoryId: '9' },

  // AUTO
  { titles: ['Видеорегистратор', 'Навигатор GPS', 'Держатель телефон', 'Зарядка авто USB', 'Чехол руль', 'Коврики авто', 'Ароматизатор авто', 'Подушка подголовник', 'Органайзер багажник', 'Зеркало салон', 'Компрессор авто', 'Домкрат', 'Аптечка авто', 'Огнетушитель', 'Трос буксир', 'Провода прикуривания', 'Щетка снег', 'Чехлы сиденье'], imageKey: 'carAccessories', priceRange: [200, 15000], brands: ['Xiaomi', 'Baseus', 'Hoco', 'Bosch', '70mai', 'Garmin', 'Pioneer'], shopIds: ['shop-auto', 'shop-xiaomi'], categoryId: '10' },

  // JEWELRY
  { titles: ['Шакек алтын', 'Шакек күмүш', 'Сөйкө алтын', 'Сөйкө күмүш', 'Колдук алтын', 'Колдук күмүш', 'Мончок', 'Кулон', 'Цепочка алтын', 'Цепочка күмүш', 'Брошь', 'Запонки'], imageKey: 'jewelry', priceRange: [500, 85000], brands: ['Pandora', 'Swarovski', 'Tiffany', 'Cartier', 'Bulgari', 'Chopard'], shopIds: ['shop-fashion'], categoryId: '3' },

  // SUNGLASSES
  { titles: ['Көз айнек Ray-Ban', 'Көз айнек Aviator', 'Көз айнек Wayfarer', 'Көз айнек спорт', 'Көз айнек поляризация', 'Көз айнек ретро', 'Көз айнек oversize', 'Көз айнек cat-eye', 'Көз айнек круглый'], imageKey: 'sunglasses', priceRange: [800, 25000], brands: ['Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace', 'Dior', 'Carrera', 'Persol'], colors: ['Кара', 'Күрөң', 'Алтын', 'Күмүш'], shopIds: ['shop-fashion', 'shop-zara'], categoryId: '3' },
];

// ===== HELPER FUNCTIONS =====
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ===== GENERATE PRODUCTS =====
function generateProducts(): Product[] {
  const allProducts: Product[] = [];
  let productId = 1;

  // Generate ~1000 products
  for (let round = 0; round < 3; round++) {
    for (const data of productData) {
      for (const title of data.titles) {
        const shopId = randomItem(data.shopIds);
        const shop = shops.find(s => s.id === shopId) || shops[0];
        const brand = randomItem(data.brands);
        const basePrice = randomInt(data.priceRange[0], data.priceRange[1]);
        const price = Math.round(basePrice / 100) * 100;
        const hasDiscount = Math.random() > 0.45;
        const discountPercent = hasDiscount ? randomInt(10, 50) : 0;
        const originalPrice = hasDiscount ? Math.round(price / (1 - discountPercent / 100) / 100) * 100 : undefined;

        // Get 2-4 random images
        const imgArr = images[data.imageKey];
        const shuffledImages = shuffle(imgArr);
        const numImages = randomInt(2, Math.min(4, shuffledImages.length));
        const productImages = shuffledImages.slice(0, numImages);

        const isGroupBuy = Math.random() > 0.75;
        const isFlashSale = !isGroupBuy && Math.random() > 0.88;
        const hasFreeship = Math.random() > 0.35;

        // Generate badges
        const badges: Badge[] = [];
        if (hasDiscount && discountPercent > 30) badges.push({ text: 'АРЗАНДАТУУ', type: 'sale' });
        if (isGroupBuy) badges.push({ text: 'БИРГЕ АЛУУ', type: 'groupbuy' });
        if (isFlashSale) badges.push({ text: 'FLASH', type: 'flash' });
        if (hasFreeship) badges.push({ text: 'АКЫСЫЗ ЖТК', type: 'freeship' });
        if (Math.random() > 0.85) badges.push({ text: 'ХИТ', type: 'hot' });
        if (Math.random() > 0.9) badges.push({ text: 'ЖАҢЫ', type: 'new' });

        const product: Product = {
          id: String(productId++),
          title: `${brand} ${title}${round > 0 ? ` ${round + 1}` : ''}`,
          price,
          originalPrice,
          images: productImages,
          brand,
          stock: randomInt(10, 500),
          soldCount: randomInt(100, 50000),
          colors: data.colors,
          sizes: data.sizes,
          shop,
          rating: Number((4 + Math.random()).toFixed(1)),
          reviewCount: randomInt(10, 3000),
          views: randomInt(500, 100000),
          likes: randomInt(50, 5000),
          badges: badges.slice(0, 3),
          isGroupBuy,
          groupBuyPrice: isGroupBuy ? Math.round(price * 0.75 / 100) * 100 : undefined,
          groupBuyMinPeople: isGroupBuy ? randomInt(2, 5) : undefined,
          hasFreeship,
          isFlashSale,
          flashSaleEndsAt: isFlashSale ? new Date(Date.now() + randomInt(1, 24) * 60 * 60 * 1000).toISOString() : undefined,
          categoryId: data.categoryId,
          description: `${brand} ${title} - сапаттуу продукт. ${shop.name} дүкөнүнөн.`,
          specifications: [
            { key: 'Бренд', value: brand },
            { key: 'Модель', value: title },
            { key: 'Гарантия', value: randomItem(['6 ай', '1 жыл', '2 жыл']) },
            { key: 'Өлкө', value: randomItem(['Кытай', 'Корея', 'Вьетнам', 'Түркия', 'Германия', 'АКШ']) },
          ],
          features: [
            'Оригинал продукт',
            hasFreeship ? 'Акысыз жеткирүү' : 'Тез жеткирүү',
            'Кайтаруу 14 күн',
            shop.isOfficialStore ? 'Официалдуу дүкөн' : 'Сапат гарантиясы',
          ].filter(Boolean),
          createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        allProducts.push(product);
      }
    }
  }

  return shuffle(allProducts);
}

// Generate all products
export const products: Product[] = generateProducts();
export { shops };

// ===== VIDEOS =====
// 200 unique product/store related video URLs from Pixabay (free to use)
const productVideoUrls = [
  // Fashion & Clothing videos (1-25)
  'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/05/27652-364709738_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/12/32070-391213303_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/25/72493-542577057_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/12/24350-342167182_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/12/47155-450877414_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/04/26458-358721117_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/05/41657-429312858_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/27/63667-506316786_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/18/36692-411115423_large.mp4',
  'https://cdn.pixabay.com/video/2019/07/15/25164-348426897_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/02/48706-455245107_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/09/64836-510062163_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/21/34430-400735629_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/21/29592-375103486_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/19/45198-442584376_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/15/68055-524116873_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/06/30710-383543847_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/14/26004-355686482_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/11/39122-419837592_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/10/70893-536004127_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/25/32915-394561842_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/22/28324-368283764_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/22/43026-434049581_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/10/61976-500054028_large.mp4',

  // Electronics & Tech videos (26-50)
  'https://cdn.pixabay.com/video/2020/08/26/48076-453313987_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/28/25011-346214897_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/04/35604-405472813_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/22/66237-515687459_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/17/50089-459927163_large.mp4',
  'https://cdn.pixabay.com/video/2019/07/31/25702-351423658_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/28/40519-425935472_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/28/69512-530127854_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/22/31528-387542936_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/19/27156-361938475_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/05/43873-437542691_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/25/72506-542592384_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/08/33527-397286541_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/05/28827-371856293_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/10/42145-430894562_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/28/63789-506542178_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/05/46504-448765123_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/28/26327-357654892_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/22/37142-413456723_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/15/65348-512348967_large.mp4',
  'https://cdn.pixabay.com/video/2020/10/04/51472-463812574_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/12/27986-366456821_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/18/39648-422156893_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/05/67124-519876432_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/05/31876-389654178_large.mp4',

  // Beauty & Cosmetics videos (51-75)
  'https://cdn.pixabay.com/video/2020/11/18/56289-482154963_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/10/30156-379852146_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/28/43612-436125478_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/02/70124-532456891_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/15/31125-385963258_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/08/26625-359854763_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/22/45562-443965127_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/18/62548-502965314_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/08/36025-407852369_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/12/29056-373654821_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/19/47658-451965284_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/28/66852-518456972_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/15/33985-398852174_large.mp4',
  'https://cdn.pixabay.com/video/2019/07/08/24752-345621893_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/05/38526-416852374_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/22/68754-526548931_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/25/50852-462145896_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/07/25856-353214786_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/15/42658-432145897_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/18/71856-539654128_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/18/32456-392548761_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/28/28652-369854213_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/12/44526-439854672_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/05/61425-498562314_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/15/36365-409856327_large.mp4',

  // Shoes & Accessories videos (76-100)
  'https://cdn.pixabay.com/video/2020/11/04/54856-478562391_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/24/30752-382156974_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/22/39985-423654812_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/10/67658-521965437_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/30/48362-454562189_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/26/27425-363548972_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/02/41254-427856941_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/08/70562-534965172_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/28/31825-388654213_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/28/29854-376854912_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/28/45985-445562398_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/05/64256-508654127_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/28/34856-402145896_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/21/26156-356548713_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/10/49254-457562841_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/22/63125-504562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/28/37562-415214896_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/05/27625-364548912_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/25/43256-435145672_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/18/68256-524856913_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/12/32125-391562847_large.mp4',
  'https://cdn.pixabay.com/video/2019/07/22/25324-349562187_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/08/46856-449562317_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/22/72125-541256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/08/38854-418256913_large.mp4',

  // Home & Kitchen videos (101-125)
  'https://cdn.pixabay.com/video/2020/10/18/53256-468562194_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/05/24025-340562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/05/33125-396145872_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/18/65752-513856927_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/02/43562-436852914_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/15/26956-361256847_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/12/36256-408562193_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/25/69125-528562174_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/22/50425-460856912_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/08/28956-372562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/18/42956-433562847_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/12/62125-500562391_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/22/32652-393856214_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/02/25625-352145896_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/15/39325-420856917_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/05/70325-533256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/08/30925-384256917_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/18/28125-367256814_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/15/44825-441256893_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/12/64956-510856214_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/18/34125-399562841_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/05/29925-378562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/15/47256-450562893_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/02/66756-519256847_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/25/37256-414256891_large.mp4',

  // Sports & Fitness videos (126-150)
  'https://cdn.pixabay.com/video/2020/10/28/54256-472562198_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/18/24562-343562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/28/33056-395562847_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/25/63456-505562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/25/45325-444562198_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/22/27256-362562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/18/36756-411562847_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/30/69856-531562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/28/51056-462856917_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/15/29256-374256891_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/08/41856-429856914_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/12/71125-536562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/18/31325-386856917_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/10/25956-354256891_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/25/40256-425256894_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/22/66056-515256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/22/34562-401256894_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/25/28456-368856912_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/08/44125-438256897_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/15/62356-501856914_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/22/47856-452562891_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/18/30456-380856917_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/05/35756-406256894_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/15/68125-523856917_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/05/48925-456256891_large.mp4',

  // Food & Grocery videos (151-175)
  'https://cdn.pixabay.com/video/2020/11/08/55256-479856914_large.mp4',
  'https://cdn.pixabay.com/video/2019/06/25/24856-345562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/08/31956-390256897_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/15/71562-538256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/18/45056-442256897_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/12/26756-360562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/02/35456-404856917_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/08/64625-509562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/15/49562-458562891_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/22/29625-375562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/12/42356-431256897_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/08/67356-520562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/12/31025-385256894_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/18/26056-355856917_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/02/38256-415856914_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/28/72756-543256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/12/33756-397856917_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/08/27756-365256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/05/43756-437856914_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/08/61756-499256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/28/48256-453856917_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/12/30256-379562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/10/36125-408256894_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/25/66456-516856914_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/20/50256-460256897_large.mp4',

  // Kids & Toys videos (176-200)
  'https://cdn.pixabay.com/video/2020/10/12/52562-466256894_large.mp4',
  'https://cdn.pixabay.com/video/2019/07/05/24456-344562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/02/15/32256-391856917_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/20/68562-525562194_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/28/45856-445856914_large.mp4',
  'https://cdn.pixabay.com/video/2019/09/28/27562-364256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/22/37025-413256891_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/25/72356-542256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/01/25/31625-388256897_large.mp4',
  'https://cdn.pixabay.com/video/2019/11/25/29756-376256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/22/43125-434256897_large.mp4',
  'https://cdn.pixabay.com/video/2021/01/28/63656-506256891_large.mp4',
  'https://cdn.pixabay.com/video/2020/08/12/47025-450256894_large.mp4',
  'https://cdn.pixabay.com/video/2019/08/25/26256-357256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/03/25/34656-401856914_large.mp4',
  'https://cdn.pixabay.com/video/2021/02/18/65625-513562198_large.mp4',
  'https://cdn.pixabay.com/video/2020/05/28/40425-426256891_large.mp4',
  'https://cdn.pixabay.com/video/2019/10/15/28025-366856917_large.mp4',
  'https://cdn.pixabay.com/video/2020/07/22/45425-443562198_large.mp4',
  'https://cdn.pixabay.com/video/2021/03/28/69425-530256894_large.mp4',
  'https://cdn.pixabay.com/video/2020/09/25/50756-461856914_large.mp4',
  'https://cdn.pixabay.com/video/2019/12/28/30856-383256897_large.mp4',
  'https://cdn.pixabay.com/video/2020/04/28/37456-415562198_large.mp4',
  'https://cdn.pixabay.com/video/2021/04/08/70456-534562891_large.mp4',
  'https://cdn.pixabay.com/video/2020/06/05/41556-428856914_large.mp4',
];

export const videos: Video[] = products.slice(0, 200).map((product, index) => ({
  id: `video-${index + 1}`,
  videoUrl: productVideoUrls[index % productVideoUrls.length],
  thumbnailUrl: product.images[0],
  productId: product.id,
  product,
  likes: randomInt(500, 100000),
  comments: randomInt(50, 10000),
  shares: randomInt(20, 5000),
  duration: randomInt(15, 120),
  isLive: index < 5,
}));

// ===== CATEGORIES =====
export const categories: Category[] = [
  { id: '1', name: 'Баары', icon: '🏠', color: '#e4393c', count: products.length },
  { id: '2', name: 'Электроника', icon: '📱', color: '#3b82f6', count: products.filter(p => p.categoryId === '2').length },
  { id: '3', name: 'Кийим', icon: '👗', color: '#ec4899', count: products.filter(p => p.categoryId === '3').length },
  { id: '4', name: 'Бут кийим', icon: '👟', color: '#8b5cf6', count: products.filter(p => p.categoryId === '4').length },
  { id: '5', name: 'Үй буюмдары', icon: '🏡', color: '#22c55e', count: products.filter(p => p.categoryId === '5').length },
  { id: '6', name: 'Косметика', icon: '💄', color: '#f43f5e', count: products.filter(p => p.categoryId === '6').length },
  { id: '7', name: 'Спорт', icon: '⚽', color: '#f59e0b', count: products.filter(p => p.categoryId === '7').length },
  { id: '8', name: 'Балдар', icon: '🧸', color: '#06b6d4', count: products.filter(p => p.categoryId === '8').length },
  { id: '9', name: 'Азык-түлүк', icon: '🍎', color: '#84cc16', count: products.filter(p => p.categoryId === '9').length },
  { id: '10', name: 'Авто', icon: '🚗', color: '#6366f1', count: products.filter(p => p.categoryId === '10').length },
];

// Legacy export
export const livestock = products;

console.log(`Generated ${products.length} products with real Unsplash images`);