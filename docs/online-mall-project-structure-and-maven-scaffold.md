# 鍦ㄧ嚎鍟嗗煄椤圭洰鐩綍缁撴瀯涓?Maven 妯″潡鑴氭墜鏋舵柟妗?
## 1. 鏂囨。鐩爣

- 缁欏嚭閫傚悎寰湇鍔″晢鍩庨」鐩殑涓€濂楀崟浠撳妯″潡鐩綍缁撴瀯
- 缁欏嚭 Maven 澶氭ā鍧楁媶鍒嗘柟寮忋€佺埗瀛?`pom.xml` 鍏崇郴鍜屽懡鍚嶈鑼?- 缁欏嚭姣忕被妯″潡鐨勮亴璐ｈ竟鐣岋紝閬垮厤鍚庣画妯″潡鑱岃矗娣蜂贡
- 缁欏嚭鑴氭墜鏋惰惤鍦伴『搴忥紝鏂逛究鐩存帴寮€濮嬫惌寤哄悗绔伐绋?
## 2. 璁捐鍘熷垯

- 鍗曚粨绠＄悊锛氬悗绔粺涓€鍦ㄤ竴涓?Git 浠撳簱涓淮鎶わ紝渚夸簬缁熶竴鐗堟湰绠＄悊
- 鍒嗗眰娓呮櫚锛氬叕鍏辫兘鍔涖€佹帴鍙ｅ绾︺€佺綉鍏炽€佷笟鍔℃湇鍔°€侀儴缃茶剼鏈€佹枃妗ｅ垎灞傛槑纭?- 渚濊禆鏀舵暃锛氭墍鏈夌増鏈粺涓€鍦ㄤ竴涓緷璧栫鐞嗘ā鍧椾腑閿佸畾
- 鏈嶅姟瑙ｈ€︼細鏈嶅姟涔嬮棿閫氳繃 `api` 濂戠害灞傚拰 HTTP/MQ 瑙ｈ€︼紝涓嶇洿鎺ヤ緷璧栧郊姝ゅ疄鐜?- 鍙笎杩涙紨杩涳細涓€鏈熷厛鎶婃牳蹇冧氦鏄撻摼璺惌璧锋潵锛屽悗缁啀缁х画鍔犳湇鍔?
## 3. 鎺ㄨ崘浠撳簱鐩綍缁撴瀯

寤鸿鍦ㄥ綋鍓嶄粨搴撴牴鐩綍閲囩敤濡備笅缁撴瀯锛?
```text
mail/
鈹溾攢 docs/
鈹? 鈹溾攢 online-mall-microservice-development.md
鈹? 鈹溾攢 online-mall-sql-schema-design.md
鈹? 鈹溾攢 online-mall-openapi-interface-catalog.md
鈹? 鈹斺攢 online-mall-project-structure-and-maven-scaffold.md
鈹溾攢 deploy/
鈹? 鈹溾攢 docker-compose.yml
鈹? 鈹溾攢 mysql/
鈹? 鈹溾攢 rocketmq/
鈹? 鈹斺攢 ...
鈹溾攢 pom.xml
鈹溾攢 mall-dependencies/
鈹? 鈹斺攢 pom.xml
鈹溾攢 mall-common/
鈹? 鈹溾攢 pom.xml
鈹? 鈹溾攢 mall-common-core/
鈹? 鈹溾攢 mall-common-web/
鈹? 鈹溾攢 mall-common-security/
鈹? 鈹溾攢 mall-common-redis/
鈹? 鈹溾攢 mall-common-mq/
鈹? 鈹溾攢 mall-common-log/
鈹? 鈹斺攢 mall-common-test/
鈹溾攢 mall-api/
鈹? 鈹溾攢 pom.xml
鈹? 鈹溾攢 mall-api-auth/
鈹? 鈹溾攢 mall-api-user/
鈹? 鈹溾攢 mall-api-product/
鈹? 鈹溾攢 mall-api-inventory/
鈹? 鈹溾攢 mall-api-cart/
鈹? 鈹溾攢 mall-api-promotion/
鈹? 鈹溾攢 mall-api-order/
鈹? 鈹溾攢 mall-api-payment/
鈹? 鈹溾攢 mall-api-logistics/
鈹? 鈹溾攢 mall-api-review/
鈹? 鈹溾攢 mall-api-content/
鈹? 鈹溾攢 mall-api-notification/
鈹? 鈹溾攢 mall-api-file/
鈹? 鈹溾攢 mall-api-admin/
鈹? 鈹斺攢 mall-api-report/
鈹溾攢 mall-gateway/
鈹? 鈹溾攢 pom.xml
鈹? 鈹斺攢 src/
鈹溾攢 mall-services/
鈹? 鈹溾攢 pom.xml
鈹? 鈹溾攢 auth-service/
鈹? 鈹溾攢 user-service/
鈹? 鈹溾攢 product-service/
鈹? 鈹溾攢 inventory-service/
鈹? 鈹溾攢 search-service/
鈹? 鈹溾攢 cart-service/
鈹? 鈹溾攢 promotion-service/
鈹? 鈹溾攢 order-service/
鈹? 鈹溾攢 payment-service/
鈹? 鈹溾攢 logistics-service/
鈹? 鈹溾攢 review-service/
鈹? 鈹溾攢 content-service/
鈹? 鈹溾攢 notification-service/
鈹? 鈹溾攢 file-service/
鈹? 鈹溾攢 admin-service/
鈹? 鈹斺攢 report-service/
鈹溾攢 mall-job/
鈹? 鈹溾攢 pom.xml
鈹? 鈹溾攢 order-job/
鈹? 鈹溾攢 report-job/
鈹? 鈹斺攢 search-job/
```

## 4. 鏍瑰伐绋嬩笌妯″潡鍏崇郴

### 4.1 鏍瑰伐绋嬭亴璐?
鏍圭洰褰?`pom.xml` 鍙壙鎷呬笁浠朵簨锛?
- 缁熶竴鑱氬悎鎵€鏈夊瓙妯″潡
- 绠＄悊缁熶竴鐨勬瀯寤哄睘鎬?- 浣滀负鎵€鏈夋ā鍧楃殑鐖?`pom`

鏍瑰伐绋嬩笉搴旇鐩存帴鏀句笟鍔′唬鐮併€?
### 4.2 鏍瑰伐绋嬫ā鍧楀垝鍒?
| 妯″潡 | 绫诲瀷 | 鑱岃矗 |
| --- | --- | --- |
| `mall-dependencies` | `pom` | 缁熶竴渚濊禆鐗堟湰鍜屾彃浠剁増鏈?|
| `mall-common` | `pom` | 鍏叡鍩虹鑳藉姏鑱氬悎妯″潡 |
| `mall-api` | `pom` | 鏈嶅姟濂戠害涓?DTO 鑱氬悎妯″潡 |
| `mall-gateway` | `jar` | Spring Cloud Gateway 缃戝叧 |
| `mall-services` | `pom` | 鎵€鏈変笟鍔″井鏈嶅姟鑱氬悎妯″潡 |
| `mall-job` | `pom` | 瀹氭椂浠诲姟銆佺绾夸换鍔¤仛鍚堟ā鍧?|

## 5. Maven 妯″潡鑱岃矗璇存槑

## 5.1 `mall-dependencies`

鑱岃矗锛?
- 缁熶竴绠＄悊鎵€鏈夌涓夋柟渚濊禆鐗堟湰
- 缁熶竴绠＄悊鎵€鏈?Maven 鎻掍欢鐗堟湰
- 鎻愪緵 BOM 椋庢牸渚濊禆绾︽潫

涓嶈鏀撅細

- 涓氬姟浠ｇ爜
- 閰嶇疆鏂囦欢
- 浠绘剰 Java 绫?
## 5.2 `mall-common`

鑱岃矗锛?
- 鎵胯浇鎵€鏈夋湇鍔″彲澶嶇敤鐨勫熀纭€鑳藉姏
- 閬垮厤閲嶅缂栧啓閫氱敤浠ｇ爜
- 涓哄悇鏈嶅姟鎻愪緵缁熶竴鍩虹璁炬柦灏佽

鎺ㄨ崘瀛愭ā鍧楋細

| 妯″潡鍚?| 鑱岃矗 |
| --- | --- |
| `mall-common-core` | 甯搁噺銆佹灇涓俱€佸紓甯搞€佸伐鍏风被銆佺粺涓€杩斿洖瀵硅薄 |
| `mall-common-web` | Web 鍏ㄥ眬寮傚父銆佸垎椤点€佸弬鏁版牎楠屻€佹嫤鎴櫒 |
| `mall-common-security` | JWT銆佺敤鎴蜂笂涓嬫枃銆佹潈闄愭敞瑙ｃ€佸畨鍏ㄥ伐鍏?|
| `mall-common-redis` | Redis Key 瑙勮寖銆佺紦瀛樺伐鍏枫€佸垎甯冨紡閿佸皝瑁?|
| `mall-common-mq` | RocketMQ 灏佽銆佹秷鎭ā鍨嬨€佸箓绛夋秷璐规敮鎸?|
| `mall-common-log` | TraceId銆佸璁℃棩蹇椼€佹棩蹇楀垏闈?|
| `mall-common-test` | 鍗曞厓娴嬭瘯鍩虹被銆丮ock 宸ュ叿銆佹祴璇曢厤缃?|

## 5.3 `mall-api`

鑱岃矗锛?
- 瀹氫箟鍚勬湇鍔″澶栨毚闇茬殑 DTO銆乂O銆佹灇涓俱€佸唴閮ㄦ帴鍙ｅ绾?- 涓?OpenFeign 鎴栧唴閮?HTTP 璋冪敤鎻愪緵鍏变韩鎺ュ彛妯″瀷

涓嶈鏀撅細

- 鏁版嵁搴撳疄浣?`Entity`
- MyBatis Mapper
- 涓氬姟 Service 瀹炵幇

寤鸿姣忎釜鏈嶅姟鍗曠嫭涓€涓?`api` 妯″潡锛岄伩鍏嶅叏閲忎簰鐩镐緷璧栥€?
## 5.4 `mall-gateway`

鑱岃矗锛?
- 璺敱杞彂
- 缁熶竴璁よ瘉
- 闄愭祦銆侀槻鍒枫€佺伆搴?- TraceId 娉ㄥ叆

涓嶈鏀撅細

- 鍟嗗搧銆佽鍗曘€佸簱瀛樼瓑涓氬姟閫昏緫

## 5.5 `mall-services`

鑱岃矗锛?
- 鎵胯浇鎵€鏈変笟鍔″井鏈嶅姟
- 姣忎釜鏈嶅姟鐙珛鏁版嵁搴撱€佺嫭绔嬮厤缃€佺嫭绔嬪惎鍔?
姣忎釜鏈嶅姟閮藉簲璇ユ槸鐙珛鐨?Spring Boot 鍙墽琛屾ā鍧椼€?
## 5.6 `mall-job`

鑱岃矗锛?
- 瀹氭椂鎵弿浠诲姟
- 鏁版嵁姹囨€讳换鍔?- 绱㈠紩閲嶅缓浠诲姟
- 琛ュ伩浠诲姟

璇存槑锛?
- 濡傛灉鍥㈤槦瑙勬ā杈冨皬锛屼篃鍙互鍏堟妸浠诲姟鍐欏湪瀵瑰簲鏈嶅姟閲?- 浣嗚鍗曡秴鏃跺叧闂€佹姤琛ㄦ眹鎬汇€佺储寮曢噸寤鸿繖绫讳换鍔★紝鍚庢湡寤鸿鐙珛妯″潡鍖?
## 6. 鏍?`pom.xml` 缁撴瀯鏂规

鏍?`pom.xml` 鎺ㄨ崘缁撴瀯濡備笅锛?
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.mall</groupId>
    <artifactId>mall-parent</artifactId>
    <version>${revision}</version>
    <packaging>pom</packaging>

    <properties>
        <revision>1.0.0-SNAPSHOT</revision>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
    </properties>

    <modules>
        <module>mall-dependencies</module>
        <module>mall-common</module>
        <module>mall-api</module>
        <module>mall-gateway</module>
        <module>mall-services</module>
        <module>mall-job</module>
    </modules>
</project>
```

## 7. `mall-dependencies` 鑴氭墜鏋舵柟妗?
### 7.1 妯″潡瀹氫綅

`mall-dependencies/pom.xml` 浣跨敤 `pom` 鎵撳寘锛岀粺涓€缁存姢锛?
- Spring Boot
- Spring Cloud
- Spring Cloud Alibaba
- MyBatis-Plus
- MySQL Driver
- Redis 瀹㈡埛绔?- RocketMQ
- OpenFeign
- Lombok
- MapStruct
- Knife4j
- Maven 缂栬瘧銆佹祴璇曘€佹墦鍖呮彃浠?
### 7.2 鎺ㄨ崘缁撴瀯

```xml
<project>
    <parent>
        <groupId>com.mall</groupId>
        <artifactId>mall-parent</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>mall-dependencies</artifactId>
    <packaging>pom</packaging>

    <properties>
        <spring.boot.version>...</spring.boot.version>
        <spring.cloud.version>...</spring.cloud.version>
        <spring.cloud.alibaba.version>...</spring.cloud.alibaba.version>
        <mybatis.plus.version>...</mybatis.plus.version>
        <knife4j.version>...</knife4j.version>
        <mapstruct.version>...</mapstruct.version>
        <lombok.version>...</lombok.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring.cloud.alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

## 8. `mall-common` 鑴氭墜鏋舵柟妗?
### 8.1 鑱氬悎 `pom`

`mall-common/pom.xml` 寤鸿鍙仛鍚堝瓙妯″潡锛?
```xml
<project>
    <parent>
        <groupId>com.mall</groupId>
        <artifactId>mall-parent</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>mall-common</artifactId>
    <packaging>pom</packaging>

    <modules>
        <module>mall-common-core</module>
        <module>mall-common-web</module>
        <module>mall-common-security</module>
        <module>mall-common-redis</module>
        <module>mall-common-mq</module>
        <module>mall-common-log</module>
        <module>mall-common-test</module>
    </modules>
</project>
```

### 8.2 鍏叡妯″潡渚濊禆寤鸿

| 妯″潡 | 渚濊禆寤鸿 |
| --- | --- |
| `mall-common-core` | 鏈€杞婚噺锛屽彧渚濊禆鍩虹鍖咃紝閬垮厤渚濊禆 Spring Web |
| `mall-common-web` | `spring-boot-starter-web`銆乣validation`銆乣core` |
| `mall-common-security` | `spring-security`銆乣jjwt`銆乣core` |
| `mall-common-redis` | `spring-data-redis`銆乣redisson`銆乣core` |
| `mall-common-mq` | `rocketmq-spring-boot-starter`銆乣core` |
| `mall-common-log` | `spring-boot-starter-aop`銆乣core` |
| `mall-common-test` | `spring-boot-starter-test`銆乣mockito` |

## 9. `mall-api` 鑴氭墜鏋舵柟妗?
### 9.1 鑱氬悎 `pom`

```xml
<project>
    <parent>
        <groupId>com.mall</groupId>
        <artifactId>mall-parent</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>mall-api</artifactId>
    <packaging>pom</packaging>

    <modules>
        <module>mall-api-auth</module>
        <module>mall-api-user</module>
        <module>mall-api-product</module>
        <module>mall-api-inventory</module>
        <module>mall-api-cart</module>
        <module>mall-api-promotion</module>
        <module>mall-api-order</module>
        <module>mall-api-payment</module>
        <module>mall-api-logistics</module>
        <module>mall-api-review</module>
        <module>mall-api-content</module>
        <module>mall-api-notification</module>
        <module>mall-api-file</module>
        <module>mall-api-admin</module>
        <module>mall-api-report</module>
    </modules>
</project>
```

### 9.2 鍗曚釜 API 妯″潡鍐呭寤鸿

浠?`mall-api-order` 涓轰緥锛屽缓璁粨鏋勶細

```text
mall-api-order/
鈹溾攢 pom.xml
鈹斺攢 src/main/java/com/mall/api/order/
   鈹溾攢 dto/
   鈹溾攢 request/
   鈹溾攢 response/
   鈹溾攢 enums/
   鈹溾攢 constant/
   鈹斺攢 facade/
```

璇存槑锛?
- `dto/`锛氶€氱敤鏁版嵁浼犺緭瀵硅薄
- `request/`锛氬唴閮ㄦ垨澶栭儴璇锋眰瀵硅薄
- `response/`锛氳繑鍥炲璞?- `enums/`锛氭湇鍔″澶栫姸鎬佹灇涓?- `facade/`锛氬彲閫夛紝瀹氫箟鍐呴儴璋冪敤濂戠害鎺ュ彛

## 10. `mall-gateway` 鑴氭墜鏋舵柟妗?
### 10.1 妯″潡鑱岃矗

- 璺敱閰嶇疆
- 璁よ瘉杩囨护鍣?- 榛戠櫧鍚嶅崟
- 闄愭祦
- 鏃ュ織鍜?TraceId 娉ㄥ叆

### 10.2 鎺ㄨ崘鐩綍缁撴瀯

```text
mall-gateway/
鈹溾攢 pom.xml
鈹斺攢 src/
   鈹溾攢 main/
   鈹? 鈹溾攢 java/com/mall/gateway/
   鈹? 鈹? 鈹溾攢 GatewayApplication.java
   鈹? 鈹? 鈹溾攢 config/
   鈹? 鈹? 鈹溾攢 filter/
   鈹? 鈹? 鈹溾攢 handler/
   鈹? 鈹? 鈹溾攢 route/
   鈹? 鈹? 鈹斺攢 security/
   鈹? 鈹斺攢 resources/
   鈹?    鈹溾攢 application.yml
   鈹?    鈹溾攢 application-local.yml
   鈹?    鈹斺攢 bootstrap.yml
   鈹斺攢 test/
```

### 10.3 渚濊禆寤鸿

- `spring-boot-starter-webflux`
- `spring-cloud-starter-gateway`
- `spring-cloud-starter-loadbalancer`
- `spring-cloud-starter-openfeign` 鍙€?- `spring-cloud-starter-alibaba-nacos-discovery`
- `spring-cloud-starter-alibaba-nacos-config`
- `mall-common-core`
- `mall-common-security`
- `mall-common-log`

## 11. `mall-services` 鑴氭墜鏋舵柟妗?
### 11.1 鑱氬悎 `pom`

```xml
<project>
    <parent>
        <groupId>com.mall</groupId>
        <artifactId>mall-parent</artifactId>
        <version>${revision}</version>
    </parent>

    <artifactId>mall-services</artifactId>
    <packaging>pom</packaging>

    <modules>
        <module>auth-service</module>
        <module>user-service</module>
        <module>product-service</module>
        <module>inventory-service</module>
        <module>search-service</module>
        <module>cart-service</module>
        <module>promotion-service</module>
        <module>order-service</module>
        <module>payment-service</module>
        <module>logistics-service</module>
        <module>review-service</module>
        <module>content-service</module>
        <module>notification-service</module>
        <module>file-service</module>
        <module>admin-service</module>
        <module>report-service</module>
    </modules>
</project>
```

### 11.2 鍗曟湇鍔℃帹鑽愮洰褰曟ā鏉?
浠?`order-service` 涓轰緥锛屽缓璁粨鏋勫涓嬶細

```text
order-service/
鈹溾攢 pom.xml
鈹斺攢 src/
   鈹溾攢 main/
   鈹? 鈹溾攢 java/com/mall/order/
   鈹? 鈹? 鈹溾攢 OrderApplication.java
   鈹? 鈹? 鈹溾攢 config/
   鈹? 鈹? 鈹溾攢 interfaces/
   鈹? 鈹? 鈹? 鈹溾攢 rest/
   鈹? 鈹? 鈹? 鈹溾攢 admin/
   鈹? 鈹? 鈹? 鈹斺攢 rpc/
   鈹? 鈹? 鈹溾攢 application/
   鈹? 鈹? 鈹? 鈹溾攢 service/
   鈹? 鈹? 鈹? 鈹溾攢 dto/
   鈹? 鈹? 鈹? 鈹斺攢 assembler/
   鈹? 鈹? 鈹溾攢 domain/
   鈹? 鈹? 鈹? 鈹溾攢 model/
   鈹? 鈹? 鈹? 鈹溾攢 service/
   鈹? 鈹? 鈹? 鈹溾攢 repository/
   鈹? 鈹? 鈹? 鈹斺攢 event/
   鈹? 鈹? 鈹溾攢 infrastructure/
   鈹? 鈹? 鈹? 鈹溾攢 persistence/
   鈹? 鈹? 鈹? 鈹? 鈹溾攢 entity/
   鈹? 鈹? 鈹? 鈹? 鈹溾攢 mapper/
   鈹? 鈹? 鈹? 鈹? 鈹斺攢 repository/
   鈹? 鈹? 鈹? 鈹溾攢 feign/
   鈹? 鈹? 鈹? 鈹溾攢 mq/
   鈹? 鈹? 鈹? 鈹溾攢 cache/
   鈹? 鈹? 鈹? 鈹斺攢 convert/
   鈹? 鈹? 鈹斺攢 task/
   鈹? 鈹斺攢 resources/
   鈹?    鈹溾攢 application.yml
   鈹?    鈹溾攢 application-local.yml
   鈹?    鈹溾攢 mapper/
   鈹?    鈹斺攢 bootstrap.yml
   鈹斺攢 test/
      鈹溾攢 java/
      鈹斺攢 resources/
```

### 11.3 鐩綍鑱岃矗瑙ｉ噴

| 鐩綍 | 鑱岃矗 |
| --- | --- |
| `interfaces/rest` | 鐢ㄦ埛绔帴鍙?Controller |
| `interfaces/admin` | 鍚庡彴鎺ュ彛 Controller |
| `interfaces/rpc` | 鍐呴儴鎺ュ彛 Controller |
| `application/service` | 搴旂敤鏈嶅姟缂栨帓銆佷簨鍔¤竟鐣?|
| `application/dto` | 鏈嶅姟鍐?DTO |
| `domain/model` | 鑱氬悎鏍广€佸疄浣撱€佸€煎璞?|
| `domain/service` | 鏍稿績棰嗗煙瑙勫垯 |
| `domain/repository` | 浠撳偍鎺ュ彛 |
| `infrastructure/persistence/entity` | 鏁版嵁搴撳疄浣?|
| `infrastructure/persistence/mapper` | MyBatis Mapper |
| `infrastructure/persistence/repository` | 浠撳偍瀹炵幇 |
| `infrastructure/feign` | 澶栭儴鏈嶅姟璋冪敤瀹㈡埛绔?|
| `infrastructure/mq` | MQ 鐢熶骇鑰?娑堣垂鑰?|
| `task` | 瀹氭椂浠诲姟鎴栧欢杩熶换鍔″鐞?|

## 12. 鍗曟湇鍔?`pom.xml` 妯℃澘寤鸿

浠?`order-service` 涓轰緥锛?
```xml
<project>
    <parent>
        <groupId>com.mall</groupId>
        <artifactId>mall-parent</artifactId>
        <version>${revision}</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>order-service</artifactId>
    <name>order-service</name>
    <packaging>jar</packaging>

    <dependencies>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-common-core</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-common-web</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-common-security</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-common-redis</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-common-mq</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-api-order</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-api-user</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-api-product</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-api-inventory</artifactId>
            <version>${revision}</version>
        </dependency>
        <dependency>
            <groupId>com.mall</groupId>
            <artifactId>mall-api-promotion</artifactId>
            <version>${revision}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 13. 姣忕被鏈嶅姟渚濊禆寤鸿

| 鏈嶅姟 | 鎺ㄨ崘渚濊禆 |
| --- | --- |
| `auth-service` | web銆乿alidation銆乻ecurity銆乺edis銆乶acos銆乵ybatis |
| `user-service` | web銆乿alidation銆乶acos銆乵ybatis |
| `product-service` | web銆乿alidation銆乺edis銆乵q銆乶acos銆乵ybatis |
| `inventory-service` | web銆乿alidation銆乺edis銆乵q銆乶acos銆乵ybatis |
| `search-service` | web銆乪lasticsearch銆乵q銆乶acos |
| `cart-service` | web銆乺edis銆乶acos |
| `promotion-service` | web銆乺edis銆乵q銆乶acos銆乵ybatis |
| `order-service` | web銆乺edis銆乵q銆乷penfeign銆乶acos銆乵ybatis |
| `payment-service` | web銆乵q銆乶acos銆乵ybatis |
| `logistics-service` | web銆乵q銆乶acos銆乵ybatis |
| `review-service` | web銆乶acos銆乵ybatis |
| `content-service` | web銆乺edis銆乶acos銆乵ybatis |
| `notification-service` | web銆乵q銆乶acos銆乵ybatis |
| `file-service` | web銆乶acos銆佸璞″瓨鍌?SDK |
| `admin-service` | web銆乻ecurity銆乶acos銆乵ybatis |
| `report-service` | web銆乵q銆乶acos銆乵ybatis |

## 14. 鍖呭悕涓?Artifact 鍛藉悕瑙勮寖

### 14.1 鍖呭悕瑙勮寖

缁熶竴閲囩敤锛?
```text
com.mall.鏈嶅姟鍚?```

绀轰緥锛?
- `com.mall.auth`
- `com.mall.user`
- `com.mall.order`
- `com.mall.gateway`

### 14.2 Artifact 鍛藉悕瑙勮寖

缁熶竴閲囩敤锛?
- 鍏叡妯″潡锛歚mall-common-*`
- 濂戠害妯″潡锛歚mall-api-*`
- 涓氬姟鏈嶅姟锛歚*-service`
- 浠诲姟妯″潡锛歚*-job`

### 14.3 鍚姩绫诲懡鍚嶈鑼?
- `AuthApplication`
- `UserApplication`
- `ProductApplication`
- `OrderApplication`
- `GatewayApplication`

## 15. 閰嶇疆鏂囦欢鏂规

### 15.1 姣忎釜鏈嶅姟鎺ㄨ崘鏂囦欢

```text
src/main/resources/
鈹溾攢 application.yml
鈹溾攢 application-local.yml
鈹溾攢 application-dev.yml
鈹溾攢 application-test.yml
鈹溾攢 application-prod.yml
鈹溾攢 bootstrap.yml
鈹斺攢 mapper/
```

### 15.2 閰嶇疆鑱岃矗

| 鏂囦欢 | 鑱岃矗 |
| --- | --- |
| `bootstrap.yml` | Nacos銆佸簲鐢ㄥ悕銆佸懡鍚嶇┖闂寸瓑鍚姩鍓嶉厤缃?|
| `application.yml` | 閫氱敤榛樿閰嶇疆 |
| `application-local.yml` | 鏈湴寮€鍙戦厤缃?|
| `application-dev.yml` | 寮€鍙戠幆澧冮厤缃?|
| `application-test.yml` | 娴嬭瘯鐜閰嶇疆 |
| `application-prod.yml` | 鐢熶骇鐜閰嶇疆 |

### 15.3 Nacos Data ID 寤鸿

寤鸿缁熶竴鍛藉悕锛?
- `${spring.application.name}.yml`
- `${spring.application.name}-${profile}.yml`

绀轰緥锛?
- `order-service.yml`
- `order-service-dev.yml`
- `order-service-prod.yml`

## 16. 娴嬭瘯妯″潡鏂规

### 16.1 鍗曞厓娴嬭瘯

姣忎釜鏈嶅姟鐙珛缁存姢锛?
```text
src/test/java/
鈹溾攢 application/
鈹溾攢 domain/
鈹溾攢 interfaces/
鈹斺攢 infrastructure/
```

### 16.2 闆嗘垚娴嬭瘯

寤鸿閫愭琛ュ厖锛?
- `mall-common-test` 涓皝瑁呮祴璇曞熀绫?- 浣跨敤 Testcontainers 鎴栨湰鍦?Docker 渚濊禆杩涜闆嗘垚娴嬭瘯
- 瀵硅鍗曘€佹敮浠樸€佸簱瀛樸€佽惀閿€鍥涗釜鏍稿績鍩熶紭鍏堣ˉ闆嗘垚娴嬭瘯

## 17. Maven 鏋勫缓鍛戒护寤鸿

### 17.1 鍏ㄩ噺鏋勫缓

```bash
mvn clean install
```

### 17.2 璺宠繃娴嬭瘯蹇€熸瀯寤?
```bash
mvn clean package -DskipTests
```

### 17.3 鏋勫缓鎸囧畾妯″潡骞惰嚜鍔ㄥ甫涓婁緷璧栨ā鍧?
```bash
mvn -pl mall-services/order-service -am clean package
```

### 17.4 鍚姩鎸囧畾鏈嶅姟

```bash
mvn -pl mall-services/order-service spring-boot:run
```

## 18. 寤鸿鐨勮剼鎵嬫灦钀藉湴椤哄簭

### 18.1 绗竴姝?
鍏堝垱寤烘牴宸ョ▼鍜屼緷璧栫鐞嗭細

1. 鏍?`pom.xml`
2. `mall-dependencies`
3. `mall-common`
4. `mall-api`

### 18.2 绗簩姝?
鍒涘缓鍩虹杩愯妯″潡锛?
1. `mall-gateway`
2. `auth-service`
3. `user-service`
4. `product-service`

### 18.3 绗笁姝?
鍒涘缓浜ゆ槗涓婚摼璺ā鍧楋細

1. `inventory-service`
2. `cart-service`
3. `promotion-service`
4. `order-service`
5. `payment-service`

### 18.4 绗洓姝?
琛ラ綈鏀拺妯″潡锛?
1. `logistics-service`
2. `review-service`
3. `content-service`
4. `notification-service`
5. `file-service`
6. `admin-service`
7. `report-service`

## 19. 涓€鏈熸渶灏忓彲杩愯妯″潡娓呭崟

濡傛灉瑕佸厛鎼嚭鏈€灏忓彲杩愯鍟嗗煄鍚庣锛屽缓璁涓€鎵瑰彧寤鸿繖浜涳細

- `mall-dependencies`
- `mall-common-core`
- `mall-common-web`
- `mall-common-security`
- `mall-api-user`
- `mall-api-product`
- `mall-api-inventory`
- `mall-api-order`
- `mall-api-payment`
- `mall-gateway`
- `auth-service`
- `user-service`
- `product-service`
- `inventory-service`
- `cart-service`
- `order-service`
- `payment-service`

杩欐牱鍙互鏈€蹇惌鍑猴細

- 鐧诲綍
- 鍟嗗搧娴忚
- 鍔犺喘
- 涓嬪崟
- 鏀粯

## 20. 涓嶅缓璁殑鍋氭硶

1. 鎵€鏈夋湇鍔″叡鐢ㄤ竴涓?`api` 澶фā鍧楋紝鍚庢湡浼氶€犳垚渚濊禆姹℃煋銆?2. 鎶婃暟鎹簱瀹炰綋鐩存帴鏀捐繘 `api` 妯″潡锛屽澶栨毚闇插唴閮ㄥ疄鐜扮粏鑺傘€?3. 鍦?`mall-common-core` 閲屽爢澶绗笁鏂逛緷璧栵紝瀵艰嚧鎵€鏈夋湇鍔¤杩紩鍏ャ€?4. 缃戝叧鐩存帴鍐欏晢鍝併€佽鍗曚笟鍔￠€昏緫锛屽悗鏈熶細鏋侀毦缁存姢銆?5. 鎵€鏈夊井鏈嶅姟閮戒簰鐩?`feign` 璋冪敤瀹炵幇绫伙紝褰㈡垚寰幆渚濊禆銆?
## 21. 鏈€缁堝缓璁?
杩欏鑴氭墜鏋舵柟妗堢殑鏍稿績鏄細

- 鏍瑰伐绋嬬粺涓€鑱氬悎
- `mall-dependencies` 缁熶竴閿佺増鏈?- `mall-common` 鎵胯浇鍏叡鑳藉姏
- `mall-api` 鎵胯浇鏈嶅姟濂戠害
- `mall-services` 鎵胯浇鐙珛涓氬姟鏈嶅姟
- 姣忎釜鏈嶅姟鍐呴儴鎸?`interfaces/application/domain/infrastructure` 鍒嗗眰

濡傛灉缁х画寰€涓嬪仛锛屼笅涓€姝ユ渶閫傚悎鐩存帴钀藉湴鐨勬槸锛?
1. 鐢熸垚鏍?`pom.xml` 鍜屽悇鑱氬悎妯″潡 `pom.xml`
2. 鍏堟妸 `auth-service`銆乣user-service`銆乣product-service`銆乣order-service` 鍥涗釜妯″潡瀹為檯寤哄嚭鏉?3. 鍐嶈ˉ缁熶竴鐨?`common` 鍩虹绫诲拰 Nacos 閰嶇疆妯℃澘
