// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriChain
 * @dev Blockchain-based supply chain tracking (Farmer -> Consumer) with delivery tracking.
 */
contract AgriChain {
    enum Role { None, Farmer, Consumer }
    enum ProduceStatus { Harvested, Sold }
    enum OrderStatus { None, Pending, Accepted, Rejected, Refunded, Completed }
    enum DeliveryStatus { None, InDelivery, Delivered }
    enum ProduceType { Vegetable, Fruit, Grain, Dairy, Meat, Herb, Spice, Nut, Seed, Other }

    struct Produce {
        uint256 id;
        string name;
        ProduceType produceType;
        string originFarm;
        string grade;
        uint256 harvestTime;
        address currentOwner;
        uint256 currentPrice;
        ProduceStatus status;
        address[] trace;
        string[] imageURIs;
        string labCertUri;
        uint256 totalQuantityKg;
        uint256 availableQuantityKg;
    }

    struct Order {
        uint256 produceId;
        address buyer;
        uint256 quantityKg;
        uint256 amountPaid;
        OrderStatus status;
        DeliveryStatus deliveryStatus;
        string deliveryAddress;
        string rejectionMessage;
    }

    uint256 public produceCount;
    uint256 public orderCount;

    mapping(address => Role) public userRoles;
    mapping(uint256 => Produce) public produces;
    mapping(address => uint256[]) public myProduceIds;

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public myOrders;
    mapping(uint256 => uint256) public escrow;

    event RegisteredUser(address indexed user, Role indexed role);
    event ProduceRegistered(uint256 indexed produceId, address indexed owner);
    event ProduceEdited(uint256 indexed produceId);
    event ProduceImagesRemoved(uint256 indexed produceId);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed produceId, address indexed buyer);
    event OrderStatusChanged(uint256 indexed orderId, OrderStatus status);
    event ProduceTransferred(uint256 indexed produceId, address indexed from, address indexed to, uint256 quantity);
    event DeliveryStatusUpdated(uint256 indexed orderId, DeliveryStatus status);

    modifier onlyRole(Role role) {
        require(userRoles[msg.sender] == role, "You don't have the required role");
        _;
    }

    modifier onlyProduceOwner(uint256 produceId) {
        require(produces[produceId].currentOwner == msg.sender, "Not owner of this produce");
        _;
    }

    // ===== USER =====
    function registerUser(Role role) external {
        require(role != Role.None, "Invalid role");
        userRoles[msg.sender] = role;
        emit RegisteredUser(msg.sender, role);
    }

    // ===== PRODUCE =====
    function registerProduce(
        string calldata name,
        ProduceType produceType,
        string calldata originFarm,
        string calldata grade,
        uint256 pricePerKg,
        string calldata labCertUri,
        uint256 totalQuantityKg
    ) external onlyRole(Role.Farmer) {
        require(totalQuantityKg > 0, "Quantity required");
        require(bytes(labCertUri).length > 0, "Lab certificate required");

        produceCount++;
        Produce storage p = produces[produceCount];
        p.id = produceCount;
        p.name = name;
        p.produceType = produceType;
        p.originFarm = originFarm;
        p.grade = grade;
        p.harvestTime = block.timestamp;
        p.currentOwner = msg.sender;
        p.currentPrice = pricePerKg;
        p.status = ProduceStatus.Harvested;
        p.labCertUri = labCertUri;
        p.totalQuantityKg = totalQuantityKg;
        p.availableQuantityKg = totalQuantityKg;
        p.trace.push(msg.sender);

        myProduceIds[msg.sender].push(produceCount);
        emit ProduceRegistered(produceCount, msg.sender);
    }

    function addProduceImages(uint256 produceId, string[] calldata newURIs) external onlyProduceOwner(produceId) {
        for (uint i = 0; i < newURIs.length; i++) {
            produces[produceId].imageURIs.push(newURIs[i]);
        }
    }

    function removeProduceImages(uint256 produceId) external onlyProduceOwner(produceId) {
        delete produces[produceId].imageURIs;
        emit ProduceImagesRemoved(produceId);
    }

    function getProduceImages(uint256 produceId) external view returns (string[] memory) {
        return produces[produceId].imageURIs;
    }

    function editProduce(
        uint256 produceId,
        string calldata newName,
        ProduceType newType,
        string calldata newGrade,
        uint256 newPrice,
        uint256 newTotalQty,
        string calldata newLabCert
    ) external onlyProduceOwner(produceId) {
        Produce storage prod = produces[produceId];
        prod.name = newName;
        prod.produceType = newType;
        prod.grade = newGrade;
        prod.currentPrice = newPrice;
        prod.totalQuantityKg = newTotalQty;
        prod.availableQuantityKg = newTotalQty;
        prod.labCertUri = newLabCert;
        emit ProduceEdited(produceId);
    }

    // ===== ORDERS =====
    function placeOrder(uint256 produceId, uint256 quantityKg, string calldata deliveryAddress) external payable {
        require(userRoles[msg.sender] == Role.Consumer, "Only consumers can buy");
        Produce storage prod = produces[produceId];
        require(quantityKg > 0 && quantityKg <= prod.availableQuantityKg, "Invalid quantity");

        uint256 totalPrice = prod.currentPrice * quantityKg;
        require(msg.value == totalPrice, "Incorrect ETH sent");

        orderCount++;
        Order storage o = orders[orderCount];
        o.produceId = produceId;
        o.buyer = msg.sender;
        o.quantityKg = quantityKg;
        o.amountPaid = msg.value;
        o.status = OrderStatus.Pending;
        o.deliveryStatus = DeliveryStatus.None;
        o.deliveryAddress = deliveryAddress;

        myOrders[msg.sender].push(orderCount);
        escrow[orderCount] = msg.value;

        emit OrderPlaced(orderCount, produceId, msg.sender);
    }

    function getProducePrice(uint256 produceId, uint256 quantityKg) external view returns (uint256 totalPrice) {
        Produce storage prod = produces[produceId];
        require(quantityKg > 0 && quantityKg <= prod.availableQuantityKg, "Invalid quantity");
        totalPrice = prod.currentPrice * quantityKg;
    }

    function acceptOrder(uint256 orderId) external onlyProduceOwner(orders[orderId].produceId) {
        Order storage ord = orders[orderId];
        Produce storage prod = produces[ord.produceId];

        require(ord.status == OrderStatus.Pending, "Order not pending");
        require(ord.quantityKg <= prod.availableQuantityKg, "Not enough quantity");

        // Deduct quantity
        prod.availableQuantityKg -= ord.quantityKg;

        ord.status = OrderStatus.Accepted;
        ord.deliveryStatus = DeliveryStatus.InDelivery;

        // Transfer ownership if full quantity bought
        if (ord.quantityKg == prod.availableQuantityKg + ord.quantityKg) {
            prod.currentOwner = ord.buyer;
        }

        prod.trace.push(ord.buyer);

        emit ProduceTransferred(ord.produceId, msg.sender, ord.buyer, ord.quantityKg);
        emit OrderStatusChanged(orderId, ord.status);
        emit DeliveryStatusUpdated(orderId, ord.deliveryStatus);
    }

    function rejectOrder(uint256 orderId, string calldata message) external onlyProduceOwner(orders[orderId].produceId) {
        Order storage ord = orders[orderId];
        require(ord.status == OrderStatus.Pending, "Order not pending");

        ord.status = OrderStatus.Rejected;
        ord.deliveryStatus = DeliveryStatus.None;
        ord.rejectionMessage = message;
        emit OrderStatusChanged(orderId, OrderStatus.Rejected);
    }

    function claimRefund(uint256 orderId) external {
        Order storage ord = orders[orderId];
        require(ord.buyer == msg.sender, "Not your order");
        require(ord.status == OrderStatus.Rejected, "Not eligible for refund");
        require(escrow[orderId] > 0, "Already refunded");

        ord.status = OrderStatus.Refunded;
        ord.deliveryStatus = DeliveryStatus.None;
        uint256 refund = escrow[orderId];
        escrow[orderId] = 0;
        payable(msg.sender).transfer(refund);
        emit OrderStatusChanged(orderId, OrderStatus.Refunded);
    }

    // ===== DELIVERY =====
    function markDelivered(uint256 orderId) external onlyProduceOwner(orders[orderId].produceId) {
        Order storage ord = orders[orderId];
        require(ord.status == OrderStatus.Accepted, "Order not accepted yet");
        require(ord.deliveryStatus == DeliveryStatus.InDelivery, "Order not in delivery");

        ord.deliveryStatus = DeliveryStatus.Delivered;
        ord.status = OrderStatus.Completed;

        uint256 payment = escrow[orderId];
        escrow[orderId] = 0;
        payable(msg.sender).transfer(payment);

        emit DeliveryStatusUpdated(orderId, ord.deliveryStatus);
        emit OrderStatusChanged(orderId, ord.status);
    }

    // ===== VIEWS =====
    function getOrderStatus(uint256 orderId) external view returns (OrderStatus, DeliveryStatus) {
        Order storage ord = orders[orderId];
        return (ord.status, ord.deliveryStatus);
    }

    function trackOrder(uint256 orderId) external view returns (string memory) {
        Order storage ord = orders[orderId];
        if(ord.status == OrderStatus.Pending) return "Pending";
        if(ord.status == OrderStatus.Accepted && ord.deliveryStatus == DeliveryStatus.InDelivery) return "In Delivery";
        if(ord.deliveryStatus == DeliveryStatus.Delivered) return "Delivered";
        if(ord.status == OrderStatus.Rejected) return "Rejected";
        if(ord.status == OrderStatus.Refunded) return "Refunded";
        return "Unknown";
    }

    function getProducesByOwner(address owner) external view returns (Produce[] memory) {
        uint256[] memory ids = myProduceIds[owner];
        Produce[] memory result = new Produce[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            result[i] = produces[ids[i]];
        }
        return result;
    }

    function getOrdersByBuyer(address buyer) external view returns (Order[] memory) {
        uint256[] memory ids = myOrders[buyer];
        Order[] memory result = new Order[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
        return result;
    }
}
